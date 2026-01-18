import React from "react";
import Link from "next/link";
import styles from "./Breadcrumbs.module.css";
import { useTranslations } from "next-intl";

export default function Breadcrumbs({ items }) {
  const ui = useTranslations("ui");
  return (
    <nav className={styles.breadcrumbs} aria-label={ui("aria.breadcrumbs")}>
      <ol>
        {items.map((item, idx) => (
          <li key={item.label}>
            {item.href && idx !== items.length - 1 ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className={styles.separator}>/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
