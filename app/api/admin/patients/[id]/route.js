import prisma from '../../../../../lib/prismaClient';

export async function PATCH(req, { params }) {
  // In Next.js app routes, `params` may be a Promise — await it before use
  const resolvedParams = typeof params?.then === 'function' ? await params : params;
  const { id } = resolvedParams || {};
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing patient id' }), { status: 400 });
  }

  // Look up patient to get userId
  let patient;
  try {
    patient = await prisma.patient.findUnique({ where: { id } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error: ' + (e.message || e) }), { status: 500 });
  }
  if (!patient) {
    return new Response(JSON.stringify({ error: 'Patient not found' }), { status: 404 });
  }
  const userId = patient.userId;

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { name, email, phone, gender, doctorId, status, bloodType, birthDate, medicalId, allergies, chronicDiseases } = body;

  try {
    // Update user (fullName/email) and patient (phone/gender) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ...(name ? { fullName: name } : {}),
          ...(email ? { email } : {}),
        },
      });

      const patientUpdate = {
        ...(phone !== undefined ? { phone } : {}),
        ...(gender ? { gender } : {}),
        ...(medicalId ? { medicalId } : {}),
        ...(bloodType ? { bloodType } : {}),
        ...(birthDate ? { birthDate: birthDate ? new Date(birthDate) : undefined } : {}),
        // ...(Array.isArray(allergies) ? { allergies } : {}),
        // ...(Array.isArray(chronicDiseases) ? { chronicDiseases } : {}),
      };

      // If doctorId is provided, set relation by userId or doctor id depending on schema
      if (doctorId) {
        // attempt to set doctorId field directly
        patientUpdate.doctorId = doctorId;
      }

      // If status is provided, update patient.status if exists
      if (status) {
        patientUpdate.status = status;
      }

      const updatedPatient = await tx.patient.update({
        where: { id },
        data: patientUpdate,
      });

      // If status changed and a linked user exists, reflect it in user.isActive
      if (status && userId) {
        await tx.user.update({ where: { id: userId }, data: { isActive: status === 'active' } });
      }

      return { user: updatedUser, patient: updatedPatient };
    });

    // Return updated patient with included user
    const patientWithUser = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    return new Response(JSON.stringify(patientWithUser), { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
