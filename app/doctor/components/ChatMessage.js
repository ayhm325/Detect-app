import React from 'react';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ message, patient }) {
  const isDoctor = message.sender === 'doctor';
  return (
    <div className={isDoctor ? styles.doctorMsg : styles.patientMsg}>
      {!isDoctor && <img src={patient.profileImage} alt={patient.name} className={styles.avatar} />}
      <span className={styles.text}>{message.text}</span>
      <span className={styles.time}>{message.time}</span>
    </div>
  );
}
