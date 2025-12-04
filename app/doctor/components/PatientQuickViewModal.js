import React from 'react';
import styles from './PatientQuickViewModal.module.css';

export default function PatientQuickViewModal({ patient, open, onClose }) {
  if (!open || !patient) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>تفاصيل المريض</h2>
        <img src={patient.profileImage} alt={patient.name} className={styles.profileImage} />
        <div>الاسم: {patient.name}</div>
        <div>العمر: {patient.age}</div>
        <div>الحالة: {patient.status}</div>
        <div>آخر فحص: {patient.lastScanDate}</div>
        <div>تاريخ طبي مختصر: {patient.medicalHistory}</div>
        <button onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
