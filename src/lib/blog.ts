import { requireDb } from '../db';
import { posts } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  author: string;
  readTime: string;
  featured: boolean;
  content: string;
}

function getDb() {
  try {
    return requireDb();
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const db = getDb();
    if (!db) return [];
    return await db.select().from(posts).orderBy(desc(posts.date));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const db = getDb();
    if (!db) return null;
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post || null;
  } catch {
    return null;
  }
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const db = getDb();
    if (!db) return [];
    return await db.select().from(posts).orderBy(desc(posts.date)).limit(limit);
  } catch {
    return [];
  }
}
