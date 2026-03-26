import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function LessonPage() {
  const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
  const { topics, getSubtopics, getLesson } = useData();

  const topic = topics.find(t => t.id === topicId);
  const subtopics = topicId ? getSubtopics(topicId) : [];
  const currentIndex = subtopics.findIndex(s => s.id === lessonId);
  const lesson = topicId && lessonId ? getLesson(topicId, lessonId) : undefined;

  const currentLesson = subtopics[currentIndex];
  const prevLesson = currentIndex > 0 ? subtopics[currentIndex - 1] : null;
  const nextLesson = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : null;
  const progress = subtopics.length > 0 ? ((currentIndex + 1) / subtopics.length) * 100 : 0;

  if (!topic || !currentLesson) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
          <Link to={`/learning/${topicId}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <ArrowLeft size={18} className="mr-2" />
              Back to Topic
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default lesson content if none exists
  const defaultBlocks = [
    { type: 'text' as const, content: `${currentLesson.title} is an important topic in astronomy. In this lesson, we will explore the key concepts and understand why it matters in our study of the cosmos.` },
    { type: 'text' as const, content: currentLesson.description },
    { type: 'text' as const, content: 'As you continue your journey through astronomy, remember that each discovery builds upon previous knowledge. Take time to observe the night sky and apply what you learn.' }
  ];

  const blocks = lesson?.blocks || defaultBlocks;

  return (
    <div className="min-h-screen pt-16 bg-[#0a0e1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/learning" className="hover:text-white">Learning</Link>
          <span>/</span>
          <Link to={`/learning/${topicId}`} className="hover:text-white">{topic.title}</Link>
          <span>/</span>
          <span className="text-orange-500">{currentLesson.title}</span>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{currentLesson.emoji}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{currentLesson.title}</h1>
          </div>
          
          {/* Progress */}
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
                  <img 
                    src={block.content} 
                    alt="Lesson illustration" 
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10">
          {prevLesson ? (
            <Link to={`/learning/${topicId}/${prevLesson.id}`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft size={18} className="mr-2" />
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <div />
          )}
          
          {nextLesson ? (
            <Link to={`/learning/${topicId}/${nextLesson.id}`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Next Lesson
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to={`/learning/${topicId}`}>
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
