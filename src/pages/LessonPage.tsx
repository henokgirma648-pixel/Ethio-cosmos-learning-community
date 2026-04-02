import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { markLessonComplete } from '@/services/progress';
import { addBookmark, removeBookmark, isBookmarked } from '@/services/bookmarks';
import { fetchBookmarks } from '@/services/bookmarks';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FallbackImage } from '@/components/MediaFallback';

export default function LessonPage() {
  const { topicSlug, lessonSlug } = useParams<{ topicSlug: string; lessonSlug: string }>();
  const { topics, getSubtopics, loadSubtopics, getLesson, loadLesson } = useData();
  const { user } = useAuth();

  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const topic = topics.find((t) => t.slug === topicSlug);
  const subtopics = topic ? getSubtopics(topic.id) : [];

  // Load subtopics + lesson content
  useEffect(() => {
    if (topic) {
      void loadSubtopics(topic.id);
    }
  }, [topic, loadSubtopics]);

  const currentSubtopic = subtopics.find((s) => s.slug === lessonSlug);

  useEffect(() => {
    if (currentSubtopic) {
      void loadLesson(currentSubtopic.id);
    }
  }, [currentSubtopic, loadLesson]);

  // Load bookmark & progress status for logged-in users
  useEffect(() => {
    if (!user || !currentSubtopic) return;

    const check = async () => {
      try {
        const [bms, bmStatus] = await Promise.all([
          fetchBookmarks(user.id),
          isBookmarked(user.id, currentSubtopic.id),
        ]);
        const existing = bms.find((b) => b.itemId === currentSubtopic.id);
        setBookmarkId(existing?.id ?? null);
        void bmStatus; // isBookmarked result is unused; we use the list approach above
      } catch { /* noop */ }
    };
    void check();
  }, [user, currentSubtopic]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleToggleBookmark = async () => {
    if (!user || !topic || !currentSubtopic) return;
    setBookmarkLoading(true);
    try {
      if (bookmarkId) {
        await removeBookmark(user.id, bookmarkId);
        setBookmarkId(null);
        showToast('Bookmark removed');
      } else {
        const bm = await addBookmark(user.id, {
          itemType: 'subtopic',
          itemId: currentSubtopic.id,
          title: currentSubtopic.title,
          description: currentSubtopic.description,
          url: `/learning/${topicSlug}/${lessonSlug}`,
        });
        setBookmarkId(bm.id);
        showToast('Bookmarked!');
      }
    } catch (err) {
      console.error('bookmark error:', err);
      showToast('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !currentSubtopic || completed) return;
    setMarkingComplete(true);
    try {
      await markLessonComplete(user.id, currentSubtopic.id);
      setCompleted(true);
      showToast('Lesson marked as complete! 🎉');
    } catch (err) {
      console.error('progress error:', err);
      showToast('Failed to record progress');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (!topic || !currentSubtopic) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
          <Link to={`/learning/${topicSlug}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <ArrowLeft size={18} className="mr-2" />
              Back to Topic
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = subtopics.findIndex((s) => s.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? subtopics[currentIndex - 1] : null;
  const nextLesson = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : null;
  const progress = subtopics.length > 0 ? ((currentIndex + 1) / subtopics.length) * 100 : 0;

  const lesson = getLesson(currentSubtopic.id);
  const defaultBlocks = [
    {
      type: 'text' as const,
      content: `${currentSubtopic.title} is an important topic in astronomy. In this lesson, we will explore the key concepts and understand why it matters in our study of the cosmos.`,
    },
    { type: 'text' as const, content: currentSubtopic.description },
    {
      type: 'text' as const,
      content:
        'As you continue your journey through astronomy, remember that each discovery builds upon previous knowledge. Take time to observe the night sky and apply what you learn.',
    },
  ];

  const blocks = lesson?.blocks.length ? lesson.blocks : defaultBlocks;

  return (
    <div className="min-h-screen pt-16 bg-[#0a0e1a]">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/learning" className="hover:text-white">
            Learning
          </Link>
          <span>/</span>
          <Link to={`/learning/${topicSlug}`} className="hover:text-white">
            {topic.title}
          </Link>
          <span>/</span>
          <span className="text-orange-500">{currentSubtopic.title}</span>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">{currentSubtopic.emoji}</span>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {currentSubtopic.title}
              </h1>
            </div>
            {user && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleBookmark}
                disabled={bookmarkLoading}
                className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                title={bookmarkId ? 'Remove bookmark' : 'Bookmark this lesson'}
              >
                {bookmarkId ? (
                  <BookmarkCheck size={18} className="text-orange-400" />
                ) : (
                  <Bookmark size={18} />
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Lesson {currentIndex + 1} of {subtopics.length}
            </span>
            <div className="flex-1 max-w-xs">
              <Progress value={progress} className="h-2 bg-slate-700" />
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-8 mb-12">
          {blocks.map((block, index) => (
            <div key={index}>
              {block.type === 'text' ? (
                <p className="text-gray-300 leading-relaxed text-lg">{block.content}</p>
              ) : (
                <div className="my-8">
                  <FallbackImage
                    src={block.content}
                    alt="Lesson illustration"
                    className="w-full rounded-lg"
                    fallbackClassName="w-full h-64 rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mark Complete */}
        {user && (
          <div className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-white/10">
            {completed ? (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle size={20} />
                <span className="font-medium">Lesson completed!</span>
              </div>
            ) : (
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle size={18} className="mr-2" />
                {markingComplete ? 'Saving…' : 'Mark as Complete'}
              </Button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10">
          {prevLesson ? (
            <Link to={`/learning/${topicSlug}/${prevLesson.slug}`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft size={18} className="mr-2" />
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link to={`/learning/${topicSlug}/${nextLesson.slug}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Next Lesson
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to={`/learning/${topicSlug}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Complete Topic
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
