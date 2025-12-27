// Returns the JWT token from cookies (for socket authentication)
export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') || '';
    // Try to find the token in cookies (adjust name if needed)
    const match = cookie.match(/token=([^;]+)/);
    if (match && match[1]) {
      return new Response(JSON.stringify({ token: match[1] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Token not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
