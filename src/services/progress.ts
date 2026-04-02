/**
 * services/progress.ts
 * User lesson progress CRUD backed by Supabase.
 */
import { supabase } from '@/supabase';
import type { TopicProgress, DbUserProgress } from '@/types';

export async function fetchCompletedSubtopicIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('subtopic_id')
    .eq('user_id', userId);

  if (error) throw new Error(`fetchCompletedSubtopicIds: ${error.message}`);
  return (data as Pick<DbUserProgress, 'subtopic_id'>[]).map((r) => r.subtopic_id);
}

export async function markLessonComplete(
  userId: string,
  subtopicId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      { user_id: userId, subtopic_id: subtopicId },
      { onConflict: 'user_id,subtopic_id' }
    );

  if (error) throw new Error(`markLessonComplete: ${error.message}`);
}

export async function markLessonIncomplete(
  userId: string,
  subtopicId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .eq('subtopic_id', subtopicId);

  if (error) throw new Error(`markLessonIncomplete: ${error.message}`);
}

/**
 * Build TopicProgress array by joining completed subtopics against
 * known topic/subtopic lists from the frontend state.
 */
export function buildTopicProgress(
  topics: Array<{ id: string; slug: string; title: string; lessonCount: number }>,
  subtopicsMap: Record<string, Array<{ id: string }>>,
  completedIds: Set<string>
): TopicProgress[] {
  return topics.map((topic) => {
    const subs = subtopicsMap[topic.id] ?? [];
    const completedSubs = subs.filter((s) => completedIds.has(s.id));
    return {
      topicId: topic.id,
      topicSlug: topic.slug,
      topicName: topic.title,
      completedLessons: completedSubs.length,
      totalLessons: topic.lessonCount,
      completedSubtopicIds: completedSubs.map((s) => s.id),
    };
  });
}
