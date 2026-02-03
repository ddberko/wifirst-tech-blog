export interface Author {
  name: string;
  role: string;
  avatar: string;
}

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
}
