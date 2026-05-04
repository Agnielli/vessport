import { getTokenFromCookies, verifyToken, clearAuthCookie } from '../../../lib/auth';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  const token = getTokenFromCookies(request.headers.get('cookie'));
  const valid = token ? await verifyToken(token) : false;

  return new Response(JSON.stringify({ authenticated: valid }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearAuthCookie(),
    },
  });
}
