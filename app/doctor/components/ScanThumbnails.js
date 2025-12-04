import React from 'react';
import styles from './ScanThumbnails.module.css';

export default function ScanThumbnails({ images, selected, onSelect }) {
  return (
    <div className={styles.thumbnails}>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`صورة ${idx + 1}`}
          className={img === selected ? styles.selected : ''}
          onClick={() => onSelect(img)}
        />
      ))}
    </div>
  );
}
