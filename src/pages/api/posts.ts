import { db } from '../../db';
import { posts } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getTokenFromCookies, verifyToken } from '../../lib/auth';

export const prerender = false;

async function requireAuth(request: Request): Promise<boolean> {
  const token = getTokenFromCookies(request.headers.get('cookie'));
  return token ? verifyToken(token) : false;
}

export async function GET() {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.date));
    return new Response(JSON.stringify(allPosts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST({ request }: { request: Request }) {
  if (!(await requireAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const slug = body.slug || body.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const [newPost] = await db.insert(posts).values({
      slug,
      title: body.title,
      excerpt: body.excerpt,
      date: body.date || new Date().toISOString().split('T')[0],
      image: body.image,
      category: body.category,
      author: body.author || 'Ves Sport',
      readTime: body.readTime || '5 min',
      featured: body.featured || false,
      content: body.content,
    }).returning();

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
