// lib/crud.js
import prisma from './prismaClient.js';

// ========== خريطة الموديلات لتسهيل الوصول ديناميكيًا ==========
const models = {
  User: prisma.user,
  Doctor: prisma.doctor,
  Patient: prisma.patient,
  Appointment: prisma.appointment,
  MedicalRecord: prisma.medicalRecord,
  Notification: prisma.notification,
  ChangeRequest: prisma.changeRequest,
  Activity: prisma.activity,
  // أضف أي موديلات أخرى هنا
};

// ========== دالة الحصول على موديل ========== 
export function getModel(modelName) {
  const model = models[modelName];
  if (!model) throw new Error(`Model ${modelName} not found in Prisma Client.`);
  return model;
}

// Helper: جلب أسماء الحقول من نموذج Prisma (عن طريق schema أو أول سجل)
async function getModelFields(model) {
  // محاولة جلب أول سجل لمعرفة الحقول
  try {
    const first = await model.findFirst();
    return first ? Object.keys(first) : [];
  } catch {
    return [];
  }
}

// ========== إنشاء سجل جديد ==========
export async function createRecord(modelName, data, userId = null) {
  const model = getModel(modelName);
  const insertData = { ...data };
  try {
    const fields = await getModelFields(model);
    if (userId && fields.includes('createdBy')) {
      insertData.createdBy = userId;
    }
    return await model.create({ data: insertData });
  } catch (error) {
    console.error(`Error creating record in ${modelName}:`, error);
    throw error;
  }
}

// ========== جلب جميع السجلات مع استبعاد المحذوفة ==========
export async function getAllRecords(modelName, options = {}) {
  const model = getModel(modelName);
  const where = options.where ? { ...options.where } : {};
  try {
    const fields = await getModelFields(model);
    if (fields.includes('isDeleted') && modelName !== 'Activity') {
      where.isDeleted = false;
    }
    return await model.findMany({ ...options, where });
  } catch (error) {
    console.error(`Error fetching records from ${modelName}:`, error);
    throw error;
  }
}

// ========== جلب سجل حسب الـ ID ==========
export async function getRecordById(modelName, id, idField = 'id', options = {}) {
  const model = getModel(modelName);
  const where = { [idField]: id };
  try {
    const fields = await getModelFields(model);
    if (fields.includes('isDeleted') && modelName !== 'Activity') {
      where.isDeleted = false;
    }
    return await model.findUnique({ where, ...options });
  } catch (error) {
    console.error(`Error fetching record by id from ${modelName}:`, error);
    throw error;
  }
}

// ========== تحديث سجل ==========
export async function updateRecord(modelName, id, data, userId = null, idField = 'id') {
  const model = getModel(modelName);
  const updateData = { ...data };
  try {
    const fields = await getModelFields(model);
    if (userId && fields.includes('updatedBy')) {
      updateData.updatedBy = userId;
    }
    return await model.update({ where: { [idField]: id }, data: updateData });
  } catch (error) {
    console.error(`Error updating record in ${modelName}:`, error);
    throw error;
  }
}

// ========== حذف سجل (soft delete إذا موجود) ==========
export async function deleteRecord(modelName, id, userId = null, idField = 'id') {
  const model = getModel(modelName);
  try {
    const fields = await getModelFields(model);
    if (fields.includes('isDeleted')) {
      const updateData = { isDeleted: true };
      if (userId && fields.includes('updatedBy')) {
        updateData.updatedBy = userId;
      }
      return await model.update({ where: { [idField]: id }, data: updateData });
    } else {
      return await model.delete({ where: { [idField]: id } });
    }
  } catch (error) {
    console.error(`Error deleting record in ${modelName}:`, error);
    throw error;
  }
}

// ========= مثال الاستخدام =========
// await createRecord('Doctor', { phone: '...', licenseNumber: '...' }, adminId)
// await getAllRecords('Doctor', { include: { user: true } })
// await updateRecord('Doctor', doctorId, { status: 'active' }, adminId)
// await deleteRecord('Doctor', doctorId, adminId)
