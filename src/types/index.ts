// ─── Database Row Types (match Supabase table columns exactly) ────────────────

export interface DbProfile {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DbTopic {
  id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  lesson_count: number;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbSubtopic {
  id: string;
  topic_id: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbLesson {
  id: string;
  subtopic_id: string;
  blocks: LessonBlock[];
  created_at: string;
  updated_at: string;
}

export interface DbChatMessage {
  id: string;
  user_id: string;
  message_text: string | null;
  image_url: string | null;
  created_at: string;
}

export interface DbBookmark {
  id: string;
  user_id: string;
  item_type: 'topic' | 'subtopic';
  item_id: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

export interface DbUserProgress {
  id: string;
  user_id: string;
  subtopic_id: string;
  completed_at: string;
}

export interface DbQuiz {
  id: string;
  topic_id: string | null;
  subtopic_id: string | null;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbQuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  sort_order: number;
  created_at: string;
}

export interface DbQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total: number;
  answers: number[];
  completed_at: string;
}

// ─── Frontend Application Types ───────────────────────────────────────────────

export interface Topic {
  id: string;        // UUID from DB
  slug: string;
  emoji: string;
  title: string;
  description: string;
  lessonCount: number;
  image: string;
  sortOrder: number;
}

export interface Subtopic {
  id: string;       // UUID from DB
  topicId: string;
  slug: string;
  emoji: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface LessonBlock {
  type: 'text' | 'image';
  content: string;
}

export interface Lesson {
  id: string;        // UUID from DB
  subtopicId: string;
  blocks: LessonBlock[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  text: string | null;
  imageUrl: string | null;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  role: 'user' | 'admin';
}

export interface FeaturedTopic {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
}

export interface VideoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
}

export interface PdfItem {
  id: string;
  url: string;
  title: string;
  label: string;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  featureCards: FeatureCard[];
  featuredTopics: FeaturedTopic[];
}

export interface AboutContent {
  missionText: string;
  whoWeAreText1: string;
  whoWeAreText2: string;
  missionImage: string;
  whoWeAreImage1: string;
  whoWeAreImage2: string;
}

export interface MaterialsContent {
  galleryImages: GalleryImage[];
  videos: VideoItem[];
  pdfs: PdfItem[];
}

export interface Bookmark {
  id: string;
  itemType: 'topic' | 'subtopic';
  itemId: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  sortOrder: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface TopicProgress {
  topicId: string;
  topicSlug: string;
  topicName: string;
  completedLessons: number;
  totalLessons: number;
  completedSubtopicIds: string[];
}
