
import { useEffect, useState } from 'react';

// جلب الطلبات المعلقة من API
export function useDoctorChangeRequests() {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    fetch('/api/doctor-change-requests')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.doctors)) {
          // تحويل بيانات الطبيب إلى نفس شكل الطلب القديم (للتوافق مع الواجهة)
          setRequests(
            data.doctors.map((doc) => ({
              id: doc.userId,
              patientName: doc.user?.fullName || '',
              newDoctor: doc.user?.fullName || '',
              status: 'pending',
              reason: 'طلب انضمام طبيب',
            }))
          );
        } else {
          setRequests([]);
        }
      })
      .catch(() => setRequests([]));
  }, []);
  return requests;
}

// الدوال التالية تحتاج تعديل لاحق لتعمل مع API حقيقي
export function approveDoctorChangeRequest(id) {
  // TODO: إرسال طلب موافقة للطبيب عبر API
  alert('تمت الموافقة (تجريبي)');
}

export async function rejectDoctorChangeRequest(id) {
  try {
    const res = await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH',
    });
    const data = await res.json();
    if (data.success) {
      alert('تم رفض الطبيب بنجاح');
    } else {
      alert('فشل الرفض: ' + (data.error || 'خطأ غير معروف'));
    }
  } catch (e) {
    alert('فشل الرفض: خطأ في الاتصال');
  }
}
