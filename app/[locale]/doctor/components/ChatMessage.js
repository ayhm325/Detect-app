import React from 'react';
import styles from './ChatMessage.module.css';

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    // quick check for common image extensions or local upload paths
    const imageExt = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i;
    if (imageExt.test(url)) return true;
    if (url.startsWith('/uploads') || url.includes('s3.amazonaws.com')) return true;
    if (url.startsWith('http') && url.includes('/uploads/')) return true;
  } catch (e) {
    return false;
  }
  return false;
}

export default function ChatMessage({ message, patient }) {
  const isDoctor = message.sender === 'doctor';
  const maybeImage = isImageUrl(message.text) || (message.file && message.file.url) || (message.fileUrl && isImageUrl(message.fileUrl));

  const imageUrl = message.file?.url || message.fileUrl || (maybeImage && message.text);

  return (
    <div className={isDoctor ? styles.doctorMsg : styles.patientMsg}>
      {!isDoctor && (
        <img
          src={patient.profileImage}
          alt={patient.name}
          width={36}
          height={36}
          className={styles.avatar}
        />
      )}

      {imageUrl ? (
        <div className={styles.attachment}>
          <img src={imageUrl} alt="attachment" className={styles.image} />
        </div>
      ) : (
        <span className={styles.text}>{message.text}</span>
      )}

      <span className={styles.time}>{message.time}</span>
    </div>
  );
}
