"use client";

import React from 'react';
import Image from 'next/image';
import styles from './ScanThumbnails.module.css';
import { useTranslations } from "next-intl";

export default function ScanThumbnails({ images, selected, onSelect }) {
  const t = useTranslations("doctorResults");

  return (
    <div className={styles.thumbnails}>
      {images.map((img, idx) => (
        <Image
          key={idx}
          src={img}
          alt={t("scanViewer.thumbnailAlt", { index: idx + 1 })}
          width={96}
          height={72}
          className={img === selected ? styles.selected : ''}
          onClick={() => onSelect(img)}
        />
      ))}
    </div>
  );
}
