/**
 * services/quizzes.ts
 * Quiz CRUD backed by Supabase.
 */
import { supabase } from '@/supabase';
import type { Quiz, QuizQuestion, DbQuiz, DbQuizQuestion, DbQuizAttempt } from '@/types';

function mapQuestion(row: DbQuizQuestion): QuizQuestion {
  return {
    id: row.id,
    questionText: row.question_text,
    options: Array.isArray(row.options) ? row.options : [],
    correctIndex: row.correct_index,
    sortOrder: row.sort_order,
  };
}

function mapQuiz(row: DbQuiz, questions: QuizQuestion[]): Quiz {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    questions,
  };
}

/** Fetch all quizzes with their questions */
export async function fetchAllQuizzes(): Promise<Quiz[]> {
  const { data: quizRows, error: qError } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true });

  if (qError) throw new Error(`fetchAllQuizzes: ${qError.message}`);

  const quizIds = (quizRows as DbQuiz[]).map((q) => q.id);
  if (quizIds.length === 0) return [];

  const { data: questionRows, error: qqError } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('quiz_id', quizIds)
    .order('sort_order', { ascending: true });

  if (qqError) throw new Error(`fetchAllQuizzes(questions): ${qqError.message}`);

  const questionsByQuiz: Record<string, QuizQuestion[]> = {};
  for (const row of (questionRows as DbQuizQuestion[])) {
    if (!questionsByQuiz[row.quiz_id]) questionsByQuiz[row.quiz_id] = [];
    questionsByQuiz[row.quiz_id].push(mapQuestion(row));
  }

  return (quizRows as DbQuiz[]).map((q) =>
    mapQuiz(q, questionsByQuiz[q.id] ?? [])
  );
}

/** Fetch a single quiz by id with its questions */
export async function fetchQuiz(quizId: string): Promise<Quiz | null> {
  const { data: quizRow, error: qError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .maybeSingle();

  if (qError) throw new Error(`fetchQuiz: ${qError.message}`);
  if (!quizRow) return null;

  const { data: questionRows, error: qqError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (qqError) throw new Error(`fetchQuiz(questions): ${qqError.message}`);

  return mapQuiz(
    quizRow as DbQuiz,
    (questionRows as DbQuizQuestion[]).map(mapQuestion)
  );
}

/** Save a quiz attempt */
export async function saveQuizAttempt(
  userId: string,
  quizId: string,
  score: number,
  total: number,
  answers: number[]
): Promise<void> {
  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: quizId,
    score,
    total,
    answers,
  });
  if (error) throw new Error(`saveQuizAttempt: ${error.message}`);
}

/** Get past attempts for a user on a quiz */
export async function fetchQuizAttempts(
  userId: string,
  quizId: string
): Promise<DbQuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(`fetchQuizAttempts: ${error.message}`);
  return data as DbQuizAttempt[];
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function createQuiz(
  title: string,
  description: string,
  topicId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({ title, description, topic_id: topicId ?? null })
    .select('id')
    .single();

  if (error) throw new Error(`createQuiz: ${error.message}`);
  return (data as { id: string }).id;
}

export async function upsertQuizQuestion(q: {
  id?: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  sort_order: number;
}): Promise<void> {
  const { error } = await supabase.from('quiz_questions').upsert(q);
  if (error) throw new Error(`upsertQuizQuestion: ${error.message}`);
}

export async function deleteQuizQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
  if (error) throw new Error(`deleteQuizQuestion: ${error.message}`);
}

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) throw new Error(`deleteQuiz: ${error.message}`);
}
