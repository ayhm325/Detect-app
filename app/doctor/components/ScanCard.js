import React from 'react';
import styles from './ScanCard.module.css';

export default function ScanCard({ scan }) {
  return (
    <div className={styles.card}>
      <img src={scan.thumbnail} alt={scan.type} className={styles.thumbnail} />
      <div>
        <div className={styles.type}>{scan.type}</div>
        <div className={styles.date}>{scan.date}</div>
      </div>
    </div>
  );
}
