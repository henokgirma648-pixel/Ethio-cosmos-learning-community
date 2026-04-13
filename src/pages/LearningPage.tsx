import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FallbackImage } from '@/components/MediaFallback';

export default function LearningPage() {
  const { topics, dataLoading } = useData();

  return (
    <div className="min-h-screen pt-16 bg-[#0d051a]">
      {/* Hero Section */}
      <section
        className="py-32 relative"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(13, 5, 26, 0.8), rgba(13, 5, 26, 0.95)), url(/images/learning-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full text-base font-semibold mb-6 tracking-wide">
              Learning Hub
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Explore the Universe
            </h1>
            <p className="text-2xl text-purple-100/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              Master astronomy step-by-step with expertly compiled learning guides and stunning visuals
            </p>
            <div className="flex items-center justify-center gap-8 text-purple-300/60 text-lg">
              <span className="flex items-center gap-3">
                <BookOpen size={24} />
                {topics.length} Topics
              </span>
              <span className="text-2xl">•</span>
              <span className="font-medium tracking-wide">⭐ Expert Written</span>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Topics Grid */}
      <section className="py-32 bg-[#0d051a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Learning Topics</h2>
            <p className="text-purple-300/50 text-xl">Choose a topic below to start your learning journey</p>
          </div>

          {dataLoading ? (
            <div className="flex justify-center py-24">
              <div className="text-purple-400 text-2xl animate-pulse">Loading topics…</div>
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-purple-300/40 text-2xl">No topics available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/learning/${topic.slug}`}
                  className="bg-purple-950/20 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all group shadow-2xl"
                >
                  <div className="h-56 overflow-hidden">
                    <FallbackImage
                      src={topic.image}
                      alt={topic.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                  <div className="p-10">
                    <div className="flex items-center gap-5 mb-6">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{topic.title}</h3>
                    </div>
                    <p className="text-purple-100/50 text-lg mb-8 leading-relaxed">{topic.description}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="flex items-center gap-3 text-base text-purple-300/40">
                        <BookOpen size={20} />
                        {topic.lessonCount} lessons
                      </span>
                      <ArrowRight
                        size={24}
                        className="text-purple-500 group-hover:translate-x-2 transition-transform"
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
