/**
 * services/bookmarks.ts
 * User bookmark CRUD backed by Supabase.
 */
import { supabase } from '@/supabase';
import type { Bookmark, DbBookmark } from '@/types';

function mapBookmark(row: DbBookmark): Bookmark {
  return {
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_id,
    title: row.title,
    description: row.description,
    url: row.url,
    createdAt: row.created_at,
  };
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`fetchBookmarks: ${error.message}`);
  return (data as DbBookmark[]).map(mapBookmark);
}

export async function addBookmark(
  userId: string,
  bookmark: Omit<Bookmark, 'id' | 'createdAt'>
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from('bookmarks')
    .upsert(
      {
        user_id: userId,
        item_type: bookmark.itemType,
        item_id: bookmark.itemId,
        title: bookmark.title,
        description: bookmark.description,
        url: bookmark.url,
      },
      { onConflict: 'user_id,item_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`addBookmark: ${error.message}`);
  return mapBookmark(data as DbBookmark);
}

export async function removeBookmark(
  userId: string,
  bookmarkId: string
): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', userId);

  if (error) throw new Error(`removeBookmark: ${error.message}`);
}

export async function isBookmarked(
  userId: string,
  itemId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}
