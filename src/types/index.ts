export interface Topic {
  id: string;
  emoji: string;
  title: string;
  description: string;
  lessonCount: number;
  image: string;
}

export interface Subtopic {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export interface LessonBlock {
  type: 'text' | 'image';
  content: string;
}

export interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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

export interface AboutImages {
  missionImage: string;
  whoWeAreImage1: string;
  whoWeAreImage2: string;
}
