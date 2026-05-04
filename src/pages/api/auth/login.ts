import { createToken, setAuthCookie } from '../../../lib/auth';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const { email, password } = await request.json();
    const adminEmail = import.meta.env.ADMIN_EMAIL || 'admin@vessport.es';
    const adminPassword = import.meta.env.ADMIN_PASSWORD || 'vesport2025';

    if (email !== adminEmail || password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Email o contraseña incorrectos' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = await createToken();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setAuthCookie(token),
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
