import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FallbackImage } from '@/components/MediaFallback';

export default function LearningPage() {
  const { topics, dataLoading } = useData();

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(5, 8, 16, 0.8), rgba(10, 14, 26, 0.95)), url(/images/learning-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-4">
              Learning
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Explore the Universe
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
              Master astronomy step-by-step with expertly compiled learning guides and stunning visuals
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <span className="flex items-center gap-2">
                <BookOpen size={18} />
                {topics.length} Topics
              </span>
              <span>•</span>
              <span>⭐ Expert Written</span>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Topics Grid */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Learning Topics</h2>
            <p className="text-gray-400 text-lg">Choose a topic below to start your learning journey</p>
          </div>

          {dataLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-gray-400">Loading topics…</div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No topics available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/learning/${topic.slug}`}
                  className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all group"
                >
                  <div className="h-40 overflow-hidden">
                    <FallbackImage
                      src={topic.image}
                      alt={topic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{topic.emoji}</span>
                      <h3 className="text-lg font-bold text-white">{topic.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen size={14} />
                        {topic.lessonCount} lessons
                      </span>
                      <ArrowRight
                        size={18}
                        className="text-orange-500 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
