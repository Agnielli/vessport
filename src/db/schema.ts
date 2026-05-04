import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  date: text('date').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  author: text('author').notNull(),
  readTime: text('read_time').notNull(),
  featured: boolean('featured').default(false),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
