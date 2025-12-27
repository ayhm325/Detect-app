
import { useEffect, useState } from 'react';

// جلب الطلبات المعلقة من API
export function useDoctorChangeRequests() {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    fetch('/api/admin/doctor-change-requests')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.requests)) {
          setRequests(
            data.requests.map((r) => ({
              id: r.id,
              patientName: r.patientName || '',
              newDoctor: r.requestedDoctorId || (r.details && r.details.requestedDoctorId) || '',
              status: r.status || 'pending',
              reason: r.reason || (r.details && r.details.reason) || ''
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
  return fetch('/api/admin/doctor-change-requests', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'approve' })
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success) {
        // reload to refresh list
        window.location.reload();
      } else {
        alert('فشل الموافقة: ' + (data.error || 'خطأ غير معروف'));
      }
    })
    .catch(() => alert('فشل الاتصال بخادم الموافقة'));
}

export async function rejectDoctorChangeRequest(id) {
  try {
    const res = await fetch('/api/admin/doctor-change-requests', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject' })
    });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    } else {
      alert('فشل الرفض: ' + (data.error || 'خطأ غير معروف'));
    }
  } catch (e) {
    alert('فشل الرفض: خطأ في الاتصال');
  }
}
