import prisma from '../../../../lib/prismaClient';

export async function GET(req) {
  try {
    const users = await prisma.user.findMany({
      include: {
        doctor: true,
        patient: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, status } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'name, email and password are required' }), { status: 400 });
    }

    // check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), { status: 409 });
    }

    // hash password
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        password: hashed,
        role: 'admin',
        isActive: (status || 'active') === 'active'
      }
    });

    // Do not return password
    const { password: _pw, ...safe } = user;

    return new Response(JSON.stringify(safe), { status: 201 });
  } catch (error) {
    console.error('Failed to create user', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
