import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FallbackImage } from '@/components/MediaFallback';

export default function HomePage() {
  const { homepage, dataLoading } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('feature-cards')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBeginJourney = () => {
    navigate('/login');
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d051a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const { heroTitle, heroSubtitle, featureCards, featuredTopics } = homepage;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center relative"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(13, 5, 26, 0.6), rgba(13, 5, 26, 0.9)), url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              <span className="text-gradient">{heroTitle}</span>
            </h1>
            <p className="text-xl text-purple-100/80 mb-10 leading-relaxed max-w-2xl">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-5">
              {!user && (
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 text-lg rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                  onClick={handleBeginJourney}
                >
                  Begin Your Journey
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg rounded-xl backdrop-blur-sm transition-all"
                onClick={scrollToFeatures}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="feature-cards" className="py-24 bg-[#0d051a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 -mt-40 relative z-10">
            {featureCards.map((card, index) => (
              <div key={index} className="bg-purple-950/40 backdrop-blur-xl rounded-2xl p-10 border border-white/10 shadow-2xl hover:border-purple-500/50 transition-all group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-purple-100/60 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Learning Topics */}
      <section className="py-24 bg-[#0a0414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Featured Learning Topics
            </h2>
            <p className="text-purple-300/60 text-xl">Essential Lessons &amp; Guides</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {featuredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-purple-950/20 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all group shadow-xl"
              >
                <div className="h-56 overflow-hidden">
                  <FallbackImage
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fallbackClassName="w-full h-full"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">{topic.title}</h3>
                  <p className="text-purple-100/50 leading-relaxed">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
