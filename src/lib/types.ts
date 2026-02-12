export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export type PostStatus = 'draft' | 'published';

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Author;
  featured: boolean;
  status: PostStatus;
  publishedAt: Date;
  updatedAt: Date;
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  author: Author;
  featured?: boolean;
  status?: PostStatus;
}

export interface Subscriber {
  uid: string;
  email: string;
  displayName: string;
  subscribedAt: Date;
  active: boolean;
  categories: string[];
  unsubscribeToken: string;
}

export interface AnalyticsEvent {
  type: 'page_view' | 'article_read';
  path: string;
  slug?: string;
  sessionId: string;
  userId?: string;
  timestamp: Date;
  date: string;
}

export interface DailyViewData {
  date: string;
  views: number;
  reads: number;
}

export interface TopArticle {
  slug: string;
  title: string;
  views: number;
}

export interface AnalyticsData {
  dailyViews: DailyViewData[];
  topArticles: TopArticle[];
  totalViews: number;
  totalReads: number;
  totalSubscribers: number;
  activeSubscribers: number;
}
