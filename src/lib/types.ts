export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  featured: boolean;
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
  author: string;
  featured?: boolean;
}
