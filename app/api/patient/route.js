import { NextResponse } from "next/server";
import prisma from "../../../lib/prismaClient";
import bcrypt from "../../../lib/auth/bcryptWrapper.mjs";

// POST /api/patient
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, doctorId } = body;
    if (!email || !password || !fullName || !doctorId) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }
    // تحقق من عدم وجود مستخدم بنفس البريد
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 409 },
      );
    }
    // إنشاء المستخدم
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        role: "patient",
        isActive: true,
        patient: {
          create: {
            fullName,
            email,
            phone: phone || null,
            doctorId: doctorId || null,
          },
        },
      },
      include: { patient: true },
    });
    
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          patientId: user.patient.id,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
