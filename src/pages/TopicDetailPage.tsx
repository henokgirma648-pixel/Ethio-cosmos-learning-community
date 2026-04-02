import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
// FallbackImage removed – background image handled via inline CSS

export default function TopicDetailPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const { topics, getSubtopics, loadSubtopics, dataLoading } = useData();

  const topic = topics.find((t) => t.slug === topicSlug);
  const subtopics = topic ? getSubtopics(topic.id) : [];

  // Load subtopics for this topic on mount
  useEffect(() => {
    if (topic) {
      void loadSubtopics(topic.id);
    }
  }, [topic, loadSubtopics]);

  if (dataLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-white">Loading…</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-[#0a0e1a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Topic Not Found</h1>
          <Link to="/learning">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <ArrowLeft size={18} className="mr-2" />
              Back to Learning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="py-16 relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 8, 16, 0.7), rgba(10, 14, 26, 0.9)), url(${topic.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/learning" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft size={18} className="mr-2" />
            Back to Topics
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{topic.emoji}</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">{topic.title}</h1>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl">{topic.description}</p>
        </div>
      </section>

      {/* Subtopics / Lessons List */}
      <section className="py-16 bg-[#0a0e1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Lessons</h2>

          {subtopics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No lessons available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subtopics.map((subtopic, index) => (
                <Link
                  key={subtopic.id}
                  to={`/learning/${topicSlug}/${subtopic.slug}`}
                  className="flex items-center gap-4 p-4 bg-slate-900/50 border border-white/10 rounded-lg hover:border-orange-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <span className="text-lg font-mono text-orange-500 w-12">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-2xl">{subtopic.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {subtopic.title}
                    </h3>
                    <p className="text-sm text-gray-400">{subtopic.description}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
