import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Placeholder response since Stripe integration was removed
    return new Response(
      JSON.stringify({
        error: 'Stripe integration has been removed. Please contact support for payment processing.'
      }),
      {
        status: 501,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};