import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const { missionText, whoWeAreText1, whoWeAreText2, missionImage, whoWeAreImage1, whoWeAreImage2 } = useData();

  const offerCards = [
    {
      title: 'Educational Content',
      description: 'In-depth articles, interactive tutorials, and guided courses on all things cosmos.',
      image: '/images/offer-education.jpg'
    },
    {
      title: 'Stargazing Tips',
      description: 'Expert advice on telescope setup, locating celestial bodies, and astrophotography techniques.',
      image: '/images/offer-stargazing.jpg'
    },
    {
      title: 'Astronomy Resources',
      description: 'Access to sky charts, community forums, virtual lectures, and a curated list of tools.',
      image: '/images/offer-resources.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="min-h-[60vh] flex items-center justify-center relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 16, 0.7), rgba(10, 14, 26, 0.9)), url(/images/about-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ethio-cosmos-learning-community
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Inspiring your passion for the cosmos, one discovery at a time.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden">
              <img 
                src={missionImage} 
                alt="Our Mission" 
                className="w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {missionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-[#050810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Who We Are</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {whoWeAreText1}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                {whoWeAreText2}
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden">
                <img 
                  src={whoWeAreImage1} 
                  alt="Team" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden">
                <img 
                  src={whoWeAreImage2} 
                  alt="Observatory" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What We Offer</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offerCards.map((card, index) => (
              <div 
                key={index}
                className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/10"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-gray-400">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Community Section */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 16, 0.8), rgba(10, 14, 26, 0.9)), url(/images/community-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join Our Community of Stargazers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Connect with fellow space explorers, share your sightings, participate in events, and stay updated with the latest astronomical news. Join us in unravelling the mysteries of the night sky.
          </p>
          
          {/* Online Users Badge - Simplified */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Community members online
          </div>
          
          <div>
            <Link to="/login">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
