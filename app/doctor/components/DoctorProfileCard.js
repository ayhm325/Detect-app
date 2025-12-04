import React from 'react';
import { FaUserMd, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';
import styles from './DoctorProfileCard.module.css';

export default function DoctorProfileCard({ doctor, onEdit }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img src={doctor.profileImage} alt="صورة الدكتور" className={styles.profileImage} />
        <div>
          <h2 className={styles.name}>{doctor.name}</h2>
          <span className={styles.specialization}><FaUserMd /> {doctor.specialization}</span>
          <span className={doctor.status === 'متصل' ? styles.online : styles.offline}>
            <FaCheckCircle /> {doctor.status}
          </span>
        </div>
      </div>
      <div className={styles.info}>
        <div><FaEnvelope /> {doctor.email}</div>
        <div><FaPhone /> {doctor.phone}</div>
      </div>
      <button className={styles.editBtn} onClick={onEdit}>تعديل المعلومات</button>
    </div>
  );
}
