import React from 'react';
import styles from './ConfirmationDialog.module.css';
import { useTranslations } from 'next-intl';

export default function ConfirmationDialog({ open, message, onConfirm, onCancel }) {
  const t = useTranslations('doctorCommon');
  const ui = useTranslations('ui');
  const placeholder = ui('placeholder');
  if (!open) return null;

  const messageText = typeof message === 'string' && message.trim().length > 0 ? message : placeholder;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <p>{messageText}</p>
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={onConfirm}>{t('confirmDialog.confirm')}</button>
          <button className={styles.cancelBtn} onClick={onCancel}>{t('confirmDialog.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
