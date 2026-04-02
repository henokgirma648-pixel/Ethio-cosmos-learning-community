/**
 * services/siteContent.ts
 * CMS content (homepage, about, materials) stored in site_content table.
 */
import { supabase } from '@/supabase';
import type { HomepageContent, AboutContent, MaterialsContent } from '@/types';

// ─── Default values (used as fallback until DB is seeded) ────────────────────

export const defaultHomepage: HomepageContent = {
  heroTitle: 'Ethio-cosmos-learning-community',
  heroSubtitle: 'Your Gateway to Astronomy Exploration & Learning',
  featureCards: [
    { icon: '🔭', title: 'Discover the Cosmos', description: 'Learn about stars, planets, galaxies, and more.' },
    { icon: '⭐', title: 'Boost Your Stargazing', description: 'Skywatching tips for beginners and enthusiasts.' },
    { icon: '📖', title: 'Stay Informed', description: 'News, guides, and resources on everything space.' },
  ],
  featuredTopics: [
    { id: 'stargazing', title: 'Stargazing Basics for Beginners', description: 'Master the fundamentals of observing the night sky with simple, beginner-friendly lessons.', image: '/images/featured-stargazing.jpg' },
    { id: 'events', title: 'Key Astronomical Events', description: 'Learn about eclipses, meteor showers, and other celestial phenomena you can observe this year.', image: '/images/featured-events.jpg' },
    { id: 'telescope', title: 'Telescope Selection Guide', description: 'Discover how to choose and use the perfect telescope for your astronomy learning journey.', image: '/images/featured-telescope.jpg' },
  ],
};

export const defaultAbout: AboutContent = {
  missionText: 'At Ethio-cosmos-learning-community, our mission is to make the vast wonders of the cosmos accessible to everyone. We strive to foster a deeper understanding of astronomy and provide tools for individuals to embark on their own journeys of celestial discovery.',
  whoWeAreText1: 'We are a diverse team of passionate astronomers, educators, and space enthusiasts dedicated to connecting the world with the universe.',
  whoWeAreText2: 'Based in Ethiopia, we are committed to building a vibrant, global learning community. Our platform offers a wealth of curated knowledge, interactive guides, and expert-led content to help you explore the stars, planets, and galaxies from anywhere.',
  missionImage: '/images/mission.jpg',
  whoWeAreImage1: '/images/who-we-are-1.jpg',
  whoWeAreImage2: '/images/who-we-are-2.jpg',
};

export const defaultMaterials: MaterialsContent = {
  galleryImages: [
    { id: '1', url: '/images/gallery-1.jpg', title: 'Nebula' },
    { id: '2', url: '/images/gallery-2.jpg', title: 'Galaxy' },
    { id: '3', url: '/images/gallery-3.jpg', title: 'Star Cluster' },
    { id: '4', url: '/images/gallery-4.jpg', title: 'Planetary' },
  ],
  videos: [
    { id: '1', url: '/videos/space-intro.mp4', thumbnail: '/images/video-thumb-1.jpg', title: 'Introduction to Space' },
  ],
  pdfs: [
    { id: '1', url: '/pdfs/astronomy-guide.pdf', title: 'Astronomy Guide', label: 'Astronomy Guide' },
    { id: '2', url: '/pdfs/telescope-manual.pdf', title: 'Telescope Manual', label: 'Telescope Manual' },
  ],
};

// ─── Generic fetch ────────────────────────────────────────────────────────────

async function fetchContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`fetchContent(${key}):`, error.message);
    return fallback;
  }
  if (!data) return fallback;
  return data.value as T;
}

async function saveContent<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(`saveContent(${key}): ${error.message}`);
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export async function fetchHomepage(): Promise<HomepageContent> {
  return fetchContent<HomepageContent>('homepage', defaultHomepage);
}

export async function saveHomepage(content: HomepageContent): Promise<void> {
  return saveContent('homepage', content);
}

// ─── About ────────────────────────────────────────────────────────────────────

export async function fetchAbout(): Promise<AboutContent> {
  return fetchContent<AboutContent>('about', defaultAbout);
}

export async function saveAbout(content: AboutContent): Promise<void> {
  return saveContent('about', content);
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function fetchMaterials(): Promise<MaterialsContent> {
  return fetchContent<MaterialsContent>('materials', defaultMaterials);
}

export async function saveMaterials(content: MaterialsContent): Promise<void> {
  return saveContent('materials', content);
}
