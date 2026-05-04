import { db } from '../../../db';
import { posts } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getTokenFromCookies, verifyToken } from '../../../lib/auth';

export const prerender = false;

async function requireAuth(request: Request): Promise<boolean> {
  const token = getTokenFromCookies(request.headers.get('cookie'));
  return token ? verifyToken(token) : false;
}

export async function GET({ params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      const [post] = await db.select().from(posts).where(eq(posts.slug, params.id));
      return post
        ? new Response(JSON.stringify(post), { status: 200, headers: { 'Content-Type': 'application/json' } })
        : new Response(JSON.stringify({ error: 'Post no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post
      ? new Response(JSON.stringify(post), { status: 200, headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ error: 'Post no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Error al obtener post' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT({ params, request }: { params: { id: string }; request: Request }) {
  if (!(await requireAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const slug = body.slug || body.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const [updated] = await db.update(posts).set({
      slug,
      title: body.title,
      excerpt: body.excerpt,
      date: body.date,
      image: body.image,
      category: body.category,
      author: body.author,
      readTime: body.readTime,
      featured: body.featured,
      content: body.content,
      updatedAt: new Date(),
    }).where(eq(posts.id, id)).returning();

    return updated
      ? new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ error: 'Post no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Error al actualizar post' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE({ params, request }: { params: { id: string }; request: Request }) {
  if (!(await requireAuth(request))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning();
    return deleted
      ? new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      : new Response(JSON.stringify({ error: 'Post no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Error al eliminar post' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
