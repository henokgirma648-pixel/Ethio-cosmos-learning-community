/**
 * DataContext.tsx
 *
 * Replaces the entire localStorage-based CMS state with Supabase-backed data.
 * All mutations go directly to the database; reads come from Supabase on mount.
 *
 * Admin writes:
 *   - Topics / subtopics / lessons  → topics service
 *   - Homepage / about / materials  → siteContent service
 *
 * Public reads happen here once and are served via context to all pages.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  fetchTopics,
  fetchSubtopics,
  fetchLesson,
  upsertTopic,
  deleteTopic,
  reorderTopics,
  upsertSubtopic,
  deleteSubtopic,
  upsertLesson,
} from '@/services/topics';
import {
  fetchHomepage,
  fetchAbout,
  fetchMaterials,
  saveHomepage,
  saveAbout,
  saveMaterials,
  defaultHomepage,
  defaultAbout,
  defaultMaterials,
} from '@/services/siteContent';
import type {
  Topic,
  Subtopic,
  Lesson,
  LessonBlock,
  HomepageContent,
  AboutContent,
  MaterialsContent,
  FeaturedTopic,
  FeatureCard,
  GalleryImage,
  VideoItem,
  PdfItem,
} from '@/types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface DataContextType {
  // Loading state
  dataLoading: boolean;

  // Homepage
  homepage: HomepageContent;
  saveHomepageContent: (c: HomepageContent) => Promise<void>;

  // About
  about: AboutContent;
  saveAboutContent: (c: AboutContent) => Promise<void>;

  // Materials
  materials: MaterialsContent;
  saveMaterialsContent: (c: MaterialsContent) => Promise<void>;

  // Topics
  topics: Topic[];
  topicsLoading: boolean;
  reloadTopics: () => Promise<void>;
  saveTopicRow: (t: Omit<Topic, 'id'> & { id?: string }) => Promise<void>;
  removeTopicRow: (id: string) => Promise<void>;
  moveTopicOrder: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Subtopics
  getSubtopics: (topicId: string) => Subtopic[];
  loadSubtopics: (topicId: string) => Promise<void>;
  saveSubtopicRow: (s: Omit<Subtopic, 'id'> & { id?: string }) => Promise<void>;
  removeSubtopicRow: (id: string) => Promise<void>;

  // Lessons
  getLesson: (subtopicId: string) => Lesson | undefined;
  loadLesson: (subtopicId: string) => Promise<void>;
  saveLessonBlocks: (subtopicId: string, blocks: LessonBlock[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataLoading, setDataLoading] = useState(true);

  // CMS content
  const [homepage, setHomepage] = useState<HomepageContent>(defaultHomepage);
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [materials, setMaterials] = useState<MaterialsContent>(defaultMaterials);

  // Topics
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Subtopics map: topicId → Subtopic[]
  const [subtopicsMap, setSubtopicsMap] = useState<Record<string, Subtopic[]>>({});

  // Lessons map: subtopicId → Lesson
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson>>({});

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        const [hp, ab, mat, topicList] = await Promise.all([
          fetchHomepage(),
          fetchAbout(),
          fetchMaterials(),
          fetchTopics(),
        ]);
        setHomepage(hp);
        setAbout(ab);
        setMaterials(mat);
        setTopics(topicList);
      } catch (err) {
        console.error('DataProvider initial load error:', err);
      } finally {
        setDataLoading(false);
      }
    };
    void load();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const reloadTopics = useCallback(async () => {
    setTopicsLoading(true);
    try {
      const list = await fetchTopics();
      setTopics(list);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  // Use a ref to track which topics are already loading/loaded to avoid duplicate calls
  const loadedTopicsRef = useRef<Set<string>>(new Set());

  const loadSubtopics = useCallback(async (topicId: string) => {
    if (loadedTopicsRef.current.has(topicId)) return;
    loadedTopicsRef.current.add(topicId);
    try {
      const subs = await fetchSubtopics(topicId);
      setSubtopicsMap((prev) => ({ ...prev, [topicId]: subs }));
    } catch (err) {
      console.error('loadSubtopics error:', err);
      loadedTopicsRef.current.delete(topicId); // allow retry on error
    }
  }, []);

  const getSubtopics = useCallback(
    (topicId: string) => subtopicsMap[topicId] ?? [],
    [subtopicsMap]
  );

  const loadedLessonsRef = useRef<Set<string>>(new Set());

  const loadLesson = useCallback(async (subtopicId: string) => {
    if (loadedLessonsRef.current.has(subtopicId)) return;
    loadedLessonsRef.current.add(subtopicId);
    try {
      const lesson = await fetchLesson(subtopicId);
      if (lesson) {
        setLessonsMap((prev) => ({ ...prev, [subtopicId]: lesson }));
      }
    } catch (err) {
      console.error('loadLesson error:', err);
      loadedLessonsRef.current.delete(subtopicId);
    }
  }, []);

  const getLesson = useCallback(
    (subtopicId: string) => lessonsMap[subtopicId],
    [lessonsMap]
  );

  // ── Topics mutations ──────────────────────────────────────────────────────────

  const saveTopicRow = useCallback(
    async (t: Omit<Topic, 'id'> & { id?: string }) => {
      const saved = await upsertTopic({
        id: t.id ?? (crypto.randomUUID()),
        slug: t.slug,
        emoji: t.emoji,
        title: t.title,
        description: t.description,
        lesson_count: t.lessonCount,
        image_url: t.image,
        sort_order: t.sortOrder,
      });
      setTopics((prev) => {
        const exists = prev.find((x) => x.id === saved.id);
        if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
        return [...prev, saved];
      });
    },
    []
  );

  const removeTopicRow = useCallback(async (id: string) => {
    await deleteTopic(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTopicOrder = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const idx = topics.findIndex((t) => t.id === id);
      if (idx < 0) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === topics.length - 1) return;

      const newTopics = [...topics];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newTopics[idx], newTopics[swapIdx]] = [newTopics[swapIdx], newTopics[idx]];

      // Assign new sort orders
      const updated = newTopics.map((t, i) => ({ ...t, sortOrder: i }));
      setTopics(updated);

      await reorderTopics(
        updated.map((t) => ({ id: t.id, sort_order: t.sortOrder }))
      );
    },
    [topics]
  );

  // ── Subtopics mutations ───────────────────────────────────────────────────────

  const saveSubtopicRow = useCallback(
    async (s: Omit<Subtopic, 'id'> & { id?: string }) => {
      const saved = await upsertSubtopic({
        id: s.id ?? crypto.randomUUID(),
        topic_id: s.topicId,
        slug: s.slug,
        emoji: s.emoji,
        title: s.title,
        description: s.description,
        sort_order: s.sortOrder,
      });
      setSubtopicsMap((prev) => {
        const current = prev[s.topicId] ?? [];
        const exists = current.find((x) => x.id === saved.id);
        return {
          ...prev,
          [s.topicId]: exists
            ? current.map((x) => (x.id === saved.id ? saved : x))
            : [...current, saved],
        };
      });
    },
    []
  );

  const removeSubtopicRow = useCallback(async (id: string) => {
    await deleteSubtopic(id);
    setSubtopicsMap((prev) => {
      const next = { ...prev };
      for (const topicId of Object.keys(next)) {
        next[topicId] = next[topicId].filter((s) => s.id !== id);
      }
      return next;
    });
  }, []);

  // ── Lesson mutations ──────────────────────────────────────────────────────────

  const saveLessonBlocks = useCallback(
    async (subtopicId: string, blocks: LessonBlock[]) => {
      const saved = await upsertLesson(subtopicId, blocks);
      setLessonsMap((prev) => ({ ...prev, [subtopicId]: saved }));
    },
    []
  );

  // ── CMS mutations ─────────────────────────────────────────────────────────────

  const saveHomepageContent = useCallback(async (c: HomepageContent) => {
    await saveHomepage(c);
    setHomepage(c);
  }, []);

  const saveAboutContent = useCallback(async (c: AboutContent) => {
    await saveAbout(c);
    setAbout(c);
  }, []);

  const saveMaterialsContent = useCallback(async (c: MaterialsContent) => {
    await saveMaterials(c);
    setMaterials(c);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <DataContext.Provider
      value={{
        dataLoading,
        homepage,
        saveHomepageContent,
        about,
        saveAboutContent,
        materials,
        saveMaterialsContent,
        topics,
        topicsLoading,
        reloadTopics,
        saveTopicRow,
        removeTopicRow,
        moveTopicOrder,
        getSubtopics,
        loadSubtopics,
        saveSubtopicRow,
        removeSubtopicRow,
        getLesson,
        loadLesson,
        saveLessonBlocks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined)
    throw new Error('useData must be used within a DataProvider');
  return context;
}

// ─── Convenience alias accessors (matching old API shape for consumer pages) ──

export function useHomepage(): { homepage: HomepageContent } & Pick<DataContextType, 'saveHomepageContent'> {
  const { homepage, saveHomepageContent } = useData();
  return { homepage, saveHomepageContent };
}

export function useAbout(): { about: AboutContent } & Pick<DataContextType, 'saveAboutContent'> {
  const { about, saveAboutContent } = useData();
  return { about, saveAboutContent };
}

export function useMaterials(): { materials: MaterialsContent } & Pick<DataContextType, 'saveMaterialsContent'> {
  const { materials, saveMaterialsContent } = useData();
  return { materials, saveMaterialsContent };
}

// Re-export types for backward compat with old imports
export type { FeaturedTopic, FeatureCard, GalleryImage, VideoItem, PdfItem };
