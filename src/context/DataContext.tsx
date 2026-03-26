import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Topic, Subtopic, Lesson, FeaturedTopic, FeatureCard, GalleryImage, VideoItem, PdfItem } from '@/types';

interface DataContextType {
  // Homepage data
  heroTitle: string;
  heroSubtitle: string;
  featureCards: FeatureCard[];
  featuredTopics: FeaturedTopic[];
  setHeroTitle: (title: string) => void;
  setHeroSubtitle: (subtitle: string) => void;
  setFeatureCards: (cards: FeatureCard[]) => void;
  setFeaturedTopics: (topics: FeaturedTopic[]) => void;
  
  // Learning data
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  getSubtopics: (topicId: string) => Subtopic[];
  setSubtopics: (topicId: string, subtopics: Subtopic[]) => void;
  getLesson: (topicId: string, lessonId: string) => Lesson | undefined;
  setLesson: (topicId: string, lessonId: string, lesson: Lesson) => void;
  
  // About page data
  missionText: string;
  whoWeAreText1: string;
  whoWeAreText2: string;
  missionImage: string;
  whoWeAreImage1: string;
  whoWeAreImage2: string;
  setMissionText: (text: string) => void;
  setWhoWeAreText1: (text: string) => void;
  setWhoWeAreText2: (text: string) => void;
  setMissionImage: (url: string) => void;
  setWhoWeAreImage1: (url: string) => void;
  setWhoWeAreImage2: (url: string) => void;
  
  // Materials data
  galleryImages: GalleryImage[];
  videos: VideoItem[];
  pdfs: PdfItem[];
  setGalleryImages: (images: GalleryImage[]) => void;
  setVideos: (videos: VideoItem[]) => void;
  setPdfs: (pdfs: PdfItem[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default data
const defaultTopics: Topic[] = [
  {
    id: 'fundamentals',
    emoji: '🚀',
    title: 'Fundamentals of Astronomy',
    description: 'Start your journey with the basics of astronomy and space observation',
    lessonCount: 12,
    image: '/images/topic-fundamentals.jpg'
  },
  {
    id: 'ethiopia',
    emoji: '🌍',
    title: 'Astronomy and Ethiopia',
    description: '7000 years of Ethiopian astronomical heritage and ancient knowledge',
    lessonCount: 3,
    image: '/images/topic-ethiopia.jpg'
  },
  {
    id: 'solar-system',
    emoji: '☀️',
    title: 'Solar System',
    description: 'Our cosmic neighborhood and the Sun\'s family of planets',
    lessonCount: 10,
    image: '/images/topic-solar-system.jpg'
  },
  {
    id: 'planets',
    emoji: '🪐',
    title: 'Planets',
    description: 'Terrestrial and gas giants of our solar system',
    lessonCount: 9,
    image: '/images/topic-planets.jpg'
  },
  {
    id: 'moon',
    emoji: '🌙',
    title: 'Moon',
    description: 'Earth\'s natural satellite and its phases',
    lessonCount: 1,
    image: '/images/topic-moon.jpg'
  },
  {
    id: 'stars',
    emoji: '⭐',
    title: 'Stars',
    description: 'The brilliant stars that light up our galaxy',
    lessonCount: 11,
    image: '/images/topic-stars.jpg'
  },
  {
    id: 'black-hole',
    emoji: '🌀',
    title: 'Black Hole',
    description: 'Mysteries of gravitational giants',
    lessonCount: 10,
    image: '/images/topic-black-hole.jpg'
  },
  {
    id: 'worm-hole',
    emoji: '🔮',
    title: 'Worm Hole',
    description: 'Theoretical structures through space-time',
    lessonCount: 6,
    image: '/images/topic-worm-hole.jpg'
  },
  {
    id: 'nebula',
    emoji: '💫',
    title: 'Nebula',
    description: 'Cosmic clouds where stars are born',
    lessonCount: 8,
    image: '/images/topic-nebula.jpg'
  },
  {
    id: 'asteroid',
    emoji: '☄️',
    title: 'Asteroid',
    description: 'Space rocks and minor celestial bodies',
    lessonCount: 6,
    image: '/images/topic-asteroid.jpg'
  }
];

const defaultSubtopics: Record<string, Subtopic[]> = {
  fundamentals: [
    { id: 'f1', emoji: '🔭', title: 'Introduction to Astronomy', description: 'Understanding the study of celestial objects' },
    { id: 'f2', emoji: '🌌', title: 'The Night Sky', description: 'Learning to navigate the stars above' },
    { id: 'f3', emoji: '📐', title: 'Celestial Coordinates', description: 'Mapping positions in the sky' },
    { id: 'f4', emoji: '🔬', title: 'Observational Tools', description: 'Telescopes, binoculars, and naked eye' },
    { id: 'f5', emoji: '⚡', title: 'Light and Radiation', description: 'How we perceive the universe' },
    { id: 'f6', emoji: '📊', title: 'Astronomical Measurements', description: 'Distances, magnitudes, and scales' },
  ],
  ethiopia: [
    { id: 'e1', emoji: '🏛️', title: 'Ancient Ethiopian Astronomy', description: 'Early stargazing traditions' },
    { id: 'e2', emoji: '📜', title: 'Astronomical Manuscripts', description: 'Historical records of the sky' },
    { id: 'e3', emoji: '🌅', title: 'Modern Ethiopian Astronomy', description: 'Contemporary developments' },
  ],
  'solar-system': [
    { id: 's1', emoji: '☀️', title: 'The Sun', description: 'Our star and its properties' },
    { id: 's2', emoji: '☿️', title: 'Mercury', description: 'The smallest planet' },
    { id: 's3', emoji: '♀️', title: 'Venus', description: 'The hottest planet' },
    { id: 's4', emoji: '🌍', title: 'Earth', description: 'Our home world' },
    { id: 's5', emoji: '♂️', title: 'Mars', description: 'The red planet' },
  ],
  planets: [
    { id: 'p1', emoji: '🪐', title: 'Gas Giants', description: 'Jupiter and Saturn' },
    { id: 'p2', emoji: '❄️', title: 'Ice Giants', description: 'Uranus and Neptune' },
    { id: 'p3', emoji: '🌑', title: 'Dwarf Planets', description: 'Pluto and beyond' },
  ],
  moon: [
    { id: 'm1', emoji: '🌙', title: 'Lunar Phases', description: 'Understanding moon cycles' },
  ],
  stars: [
    { id: 'st1', emoji: '⭐', title: 'Star Formation', description: 'How stars are born' },
    { id: 'st2', emoji: '💥', title: 'Star Life Cycle', description: 'Birth to death of stars' },
    { id: 'st3', emoji: '🌟', title: 'Types of Stars', description: 'Classifying stellar objects' },
  ],
  'black-hole': [
    { id: 'b1', emoji: '🌀', title: 'What is a Black Hole?', description: 'Understanding these mysterious objects' },
    { id: 'b2', emoji: '⚫', title: 'Event Horizon', description: 'The point of no return' },
    { id: 'b3', emoji: '🌌', title: 'Supermassive Black Holes', description: 'Giants at galaxy centers' },
  ],
  'worm-hole': [
    { id: 'w1', emoji: '🔮', title: 'Wormhole Theory', description: 'Einstein-Rosen bridges' },
    { id: 'w2', emoji: '🚀', title: 'Interstellar Travel', description: 'Theoretical space travel' },
  ],
  nebula: [
    { id: 'n1', emoji: '💫', title: 'Star Nurseries', description: 'Where stars are born' },
    { id: 'n2', emoji: '🌈', title: 'Types of Nebulae', description: 'Emission, reflection, and dark' },
  ],
  asteroid: [
    { id: 'a1', emoji: '☄️', title: 'Asteroid Belt', description: 'The region between Mars and Jupiter' },
    { id: 'a2', emoji: '🌍', title: 'Near-Earth Objects', description: 'Asteroids close to home' },
  ]
};

const defaultFeatureCards: FeatureCard[] = [
  { icon: '🔭', title: 'Discover the Cosmos', description: 'Learn about stars, planets, galaxies, and more.' },
  { icon: '⭐', title: 'Boost Your Stargazing', description: 'Skywatching tips for beginners and enthusiasts.' },
  { icon: '📖', title: 'Stay Informed', description: 'News, guides, and resources on everything space.' }
];

const defaultFeaturedTopics: FeaturedTopic[] = [
  {
    id: 'stargazing',
    title: 'Stargazing Basics for Beginners',
    description: 'Master the fundamentals of observing the night sky with simple, beginner-friendly lessons.',
    image: '/images/featured-stargazing.jpg'
  },
  {
    id: 'events',
    title: 'Key Astronomical Events',
    description: 'Learn about eclipses, meteor showers, and other celestial phenomena you can observe this year.',
    image: '/images/featured-events.jpg'
  },
  {
    id: 'telescope',
    title: 'Telescope Selection Guide',
    description: 'Discover how to choose and use the perfect telescope for your astronomy learning journey.',
    image: '/images/featured-telescope.jpg'
  }
];

const defaultGalleryImages: GalleryImage[] = [
  { id: '1', url: '/images/gallery-1.jpg', title: 'Nebula' },
  { id: '2', url: '/images/gallery-2.jpg', title: 'Galaxy' },
  { id: '3', url: '/images/gallery-3.jpg', title: 'Star Cluster' },
  { id: '4', url: '/images/gallery-4.jpg', title: 'Planetary' }
];

const defaultVideos: VideoItem[] = [
  { id: '1', url: '/videos/space-intro.mp4', thumbnail: '/images/video-thumb-1.jpg', title: 'Introduction to Space' }
];

const defaultPdfs: PdfItem[] = [
  { id: '1', url: '/pdfs/astronomy-guide.pdf', title: 'Astronomy Guide', label: 'Astronomy Guide' },
  { id: '2', url: '/pdfs/telescope-manual.pdf', title: 'Telescope Manual', label: 'Telescope Manual' }
];

export function DataProvider({ children }: { children: ReactNode }) {
  // Homepage state
  const [heroTitle, setHeroTitleState] = useState('Ethio-cosmos-learning-community');
  const [heroSubtitle, setHeroSubtitleState] = useState('Your Gateway to Astronomy Exploration & Learning');
  const [featureCards, setFeatureCardsState] = useState<FeatureCard[]>(defaultFeatureCards);
  const [featuredTopics, setFeaturedTopicsState] = useState<FeaturedTopic[]>(defaultFeaturedTopics);
  
  // Learning state
  const [topics, setTopicsState] = useState<Topic[]>(defaultTopics);
  const [subtopicsMap, setSubtopicsMap] = useState<Record<string, Subtopic[]>>(defaultSubtopics);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson>>({});
  
  // About page state
  const [missionText, setMissionTextState] = useState('At Ethio-cosmos-learning-community, our mission is to make the vast wonders of the cosmos accessible to everyone. We strive to foster a deeper understanding of astronomy and provide tools for individuals to embark on their own journeys of celestial discovery.');
  const [whoWeAreText1, setWhoWeAreText1State] = useState('We are a diverse team of passionate astronomers, educators, and space enthusiasts dedicated to connecting the world with the universe.');
  const [whoWeAreText2, setWhoWeAreText2State] = useState('Based in Ethiopia, we are committed to building a vibrant, global learning community. Our platform offers a wealth of curated knowledge, interactive guides, and expert-led content to help you explore the stars, planets, and galaxies from anywhere.');
  const [missionImage, setMissionImageState] = useState('/images/mission.jpg');
  const [whoWeAreImage1, setWhoWeAreImage1State] = useState('/images/who-we-are-1.jpg');
  const [whoWeAreImage2, setWhoWeAreImage2State] = useState('/images/who-we-are-2.jpg');
  
  // Materials state
  const [galleryImages, setGalleryImagesState] = useState<GalleryImage[]>(defaultGalleryImages);
  const [videos, setVideosState] = useState<VideoItem[]>(defaultVideos);
  const [pdfs, setPdfsState] = useState<PdfItem[]>(defaultPdfs);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('ethioCosmosData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.heroTitle) setHeroTitleState(parsed.heroTitle);
        if (parsed.heroSubtitle) setHeroSubtitleState(parsed.heroSubtitle);
        if (parsed.featureCards) setFeatureCardsState(parsed.featureCards);
        if (parsed.featuredTopics) setFeaturedTopicsState(parsed.featuredTopics);
        if (parsed.topics) setTopicsState(parsed.topics);
        if (parsed.subtopicsMap) setSubtopicsMap(parsed.subtopicsMap);
        if (parsed.lessonsMap) setLessonsMap(parsed.lessonsMap);
        if (parsed.missionText) setMissionTextState(parsed.missionText);
        if (parsed.whoWeAreText1) setWhoWeAreText1State(parsed.whoWeAreText1);
        if (parsed.whoWeAreText2) setWhoWeAreText2State(parsed.whoWeAreText2);
        if (parsed.missionImage) setMissionImageState(parsed.missionImage);
        if (parsed.whoWeAreImage1) setWhoWeAreImage1State(parsed.whoWeAreImage1);
        if (parsed.whoWeAreImage2) setWhoWeAreImage2State(parsed.whoWeAreImage2);
        if (parsed.galleryImages) setGalleryImagesState(parsed.galleryImages);
        if (parsed.videos) setVideosState(parsed.videos);
        if (parsed.pdfs) setPdfsState(parsed.pdfs);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      heroTitle,
      heroSubtitle,
      featureCards,
      featuredTopics,
      topics,
      subtopicsMap,
      lessonsMap,
      missionText,
      whoWeAreText1,
      whoWeAreText2,
      missionImage,
      whoWeAreImage1,
      whoWeAreImage2,
      galleryImages,
      videos,
      pdfs
    };
    localStorage.setItem('ethioCosmosData', JSON.stringify(dataToSave));
  }, [heroTitle, heroSubtitle, featureCards, featuredTopics, topics, subtopicsMap, lessonsMap, missionText, whoWeAreText1, whoWeAreText2, missionImage, whoWeAreImage1, whoWeAreImage2, galleryImages, videos, pdfs]);

  const setHeroTitle = (title: string) => setHeroTitleState(title);
  const setHeroSubtitle = (subtitle: string) => setHeroSubtitleState(subtitle);
  const setFeatureCards = (cards: FeatureCard[]) => setFeatureCardsState(cards);
  const setFeaturedTopics = (topics: FeaturedTopic[]) => setFeaturedTopicsState(topics);
  const setTopics = (topics: Topic[]) => setTopicsState(topics);
  const setSubtopics = (topicId: string, subtopics: Subtopic[]) => {
    setSubtopicsMap(prev => ({ ...prev, [topicId]: subtopics }));
  };
  const getSubtopics = (topicId: string) => subtopicsMap[topicId] || [];
  const setLesson = (topicId: string, lessonId: string, lesson: Lesson) => {
    setLessonsMap(prev => ({ ...prev, [`${topicId}-${lessonId}`]: lesson }));
  };
  const getLesson = (topicId: string, lessonId: string) => lessonsMap[`${topicId}-${lessonId}`];
  const setMissionText = (text: string) => setMissionTextState(text);
  const setWhoWeAreText1 = (text: string) => setWhoWeAreText1State(text);
  const setWhoWeAreText2 = (text: string) => setWhoWeAreText2State(text);
  const setMissionImage = (url: string) => setMissionImageState(url);
  const setWhoWeAreImage1 = (url: string) => setWhoWeAreImage1State(url);
  const setWhoWeAreImage2 = (url: string) => setWhoWeAreImage2State(url);
  const setGalleryImages = (images: GalleryImage[]) => setGalleryImagesState(images);
  const setVideos = (videos: VideoItem[]) => setVideosState(videos);
  const setPdfs = (pdfs: PdfItem[]) => setPdfsState(pdfs);

  return (
    <DataContext.Provider value={{
      heroTitle,
      heroSubtitle,
      featureCards,
      featuredTopics,
      setHeroTitle,
      setHeroSubtitle,
      setFeatureCards,
      setFeaturedTopics,
      topics,
      setTopics,
      getSubtopics,
      setSubtopics,
      getLesson,
      setLesson,
      missionText,
      whoWeAreText1,
      whoWeAreText2,
      missionImage,
      whoWeAreImage1,
      whoWeAreImage2,
      setMissionText,
      setWhoWeAreText1,
      setWhoWeAreText2,
      setMissionImage,
      setWhoWeAreImage1,
      setWhoWeAreImage2,
      galleryImages,
      videos,
      pdfs,
      setGalleryImages,
      setVideos,
      setPdfs
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
