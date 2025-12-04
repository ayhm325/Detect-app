import React from 'react';
import styles from './PatientCard.module.css';

export default function PatientCard({ patient }) {
  return (
    <div className={styles.card}>
      <img src={patient.profileImage} alt={patient.name} className={styles.profileImage} />
      <div>
        <div className={styles.name}>{patient.name}</div>
        <div className={styles.age}>العمر: {patient.age}</div>
      </div>
    </div>
  );
}
