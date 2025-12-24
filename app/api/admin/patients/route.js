import { getAllRecords, createRecord } from '../../../../lib/prismaCrud';
import prisma from '../../../../lib/prismaClient';

export async function GET(req) {
  try {
    // Include related user and doctor (with their user) and counts for appointments & medicalRecords
    const include = {
      user: true,
      doctor: { include: { user: true } },
      _count: { select: { appointments: true, medicalRecords: true } },
    };
    const patients = await getAllRecords('Patient', { include });
    return new Response(JSON.stringify(patients), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// إضافة مريض جديد
export async function POST(req) {
  try {
    const body = await req.json();
    // تحقق من الحقول المطلوبة
    if (!body.name || !body.email || !body.phone) {
      return new Response(JSON.stringify({ error: 'الاسم والبريد والهاتف مطلوبة' }), { status: 400 });
    }
    // 1. Create User first
    const user = await prisma.user.create({
      data: {
        fullName: body.name,
        email: body.email,
        password: body.password || 'changeme', // Consider handling passwords securely
        role: 'patient',
        isActive: (body.status || 'active') === 'active',
      },
    });
    // 2. Create Patient linked to User
    const data = {
      userId: user.id,
      fullName: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender || null,
      bloodType: body.bloodType || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      status: body.status || 'active',
      medicalId: body.medicalId || undefined,
      ...(body.doctorId ? { doctor: { connect: { userId: body.doctorId } } } : {}),
    };
    const patient = await createRecord('Patient', data);
    return new Response(JSON.stringify(patient), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
