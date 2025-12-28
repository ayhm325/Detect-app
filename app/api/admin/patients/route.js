import { getAllRecords, createRecord } from '../../../../lib/prismaCrud';
import prisma from '../../../../lib/prismaClient';
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/admin/patients" } });
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
  }
  try {
    const include = {
      user: true,
      doctor: { include: { user: true } },
      _count: { select: { appointments: true, medicalRecords: true } },
    };
    const patients = await getAllRecords('Patient', { include });
    logAudit({ event: "admin_patients_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: patients.length } });
    return new Response(JSON.stringify(patients), { status: 200 });
  } catch (error) {
    logAudit({ event: "admin_patients_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, ["admin"]);

export const POST = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/admin/patients" } });
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone) {
      return new Response(JSON.stringify({ error: 'الاسم والبريد والهاتف مطلوبة' }), { status: 400 });
    }
    const userCreated = await prisma.user.create({
      data: {
        fullName: body.name,
        email: body.email,
        password: body.password || 'changeme',
        role: 'patient',
        isActive: (body.status || 'active') === 'active',
      },
    });
    const data = {
      userId: userCreated.id,
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
    logAudit({ event: "admin_patient_created", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { patientId: patient.id } });
    return new Response(JSON.stringify(patient), { status: 201 });
  } catch (error) {
    logAudit({ event: "admin_patient_create_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}, ["admin"]);
