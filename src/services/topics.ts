/**
 * services/topics.ts
 * All Supabase queries for topics, subtopics, and lessons.
 */
import { supabase } from '@/supabase';
import type {
  Topic, Subtopic, Lesson, LessonBlock,
  DbTopic, DbSubtopic, DbLesson,
} from '@/types';

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapTopic(row: DbTopic): Topic {
  return {
    id: row.id,
    slug: row.slug,
    emoji: row.emoji,
    title: row.title,
    description: row.description,
    lessonCount: row.lesson_count,
    image: row.image_url,
    sortOrder: row.sort_order,
  };
}

export function mapSubtopic(row: DbSubtopic): Subtopic {
  return {
    id: row.id,
    topicId: row.topic_id,
    slug: row.slug,
    emoji: row.emoji,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapLesson(row: DbLesson): Lesson {
  return {
    id: row.id,
    subtopicId: row.subtopic_id,
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
  };
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchTopics: ${error.message}`);
  return (data as DbTopic[]).map(mapTopic);
}

export async function upsertTopic(
  topic: Omit<DbTopic, 'created_at' | 'updated_at'>
): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .upsert({ ...topic, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`upsertTopic: ${error.message}`);
  return mapTopic(data as DbTopic);
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw new Error(`deleteTopic: ${error.message}`);
}

export async function reorderTopics(
  updates: { id: string; sort_order: number }[]
): Promise<void> {
  for (const u of updates) {
    const { error } = await supabase
      .from('topics')
      .update({ sort_order: u.sort_order, updated_at: new Date().toISOString() })
      .eq('id', u.id);
    if (error) throw new Error(`reorderTopics: ${error.message}`);
  }
}

// ─── Subtopics ────────────────────────────────────────────────────────────────

export async function fetchSubtopics(topicId: string): Promise<Subtopic[]> {
  const { data, error } = await supabase
    .from('subtopics')
    .select('*')
    .eq('topic_id', topicId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchSubtopics: ${error.message}`);
  return (data as DbSubtopic[]).map(mapSubtopic);
}

export async function upsertSubtopic(
  subtopic: Omit<DbSubtopic, 'created_at' | 'updated_at'>
): Promise<Subtopic> {
  const { data, error } = await supabase
    .from('subtopics')
    .upsert({ ...subtopic, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`upsertSubtopic: ${error.message}`);
  return mapSubtopic(data as DbSubtopic);
}

export async function deleteSubtopic(id: string): Promise<void> {
  const { error } = await supabase.from('subtopics').delete().eq('id', id);
  if (error) throw new Error(`deleteSubtopic: ${error.message}`);
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export async function fetchLesson(subtopicId: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .maybeSingle();

  if (error) throw new Error(`fetchLesson: ${error.message}`);
  if (!data) return null;
  return mapLesson(data as DbLesson);
}

export async function upsertLesson(
  subtopicId: string,
  blocks: LessonBlock[]
): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .upsert(
      {
        subtopic_id: subtopicId,
        blocks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'subtopic_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertLesson: ${error.message}`);
  return mapLesson(data as DbLesson);
}
