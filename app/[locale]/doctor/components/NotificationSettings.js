import React from 'react';
import styles from './NotificationSettings.module.css';
import { useTranslations } from 'next-intl';

export default function NotificationSettings({ value, onChange }) {
  const t = useTranslations('doctorSettings');

  return (
    <div className={styles.notifications}>
      <h3>{t('doctorSettings.notifications.title')}</h3>
      <label>
        <input
          type="checkbox"
          checked={value.email || false}
          onChange={e => onChange({ ...value, email: e.target.checked })}
        />
        {t('doctorSettings.notifications.email')}
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.sms || false}
          onChange={e => onChange({ ...value, sms: e.target.checked })}
        />
        {t('doctorSettings.notifications.sms')}
      </label>
      <label>
        <input
          type="checkbox"
          checked={value.inApp || false}
          onChange={e => onChange({ ...value, inApp: e.target.checked })}
        />
        {t('doctorSettings.notifications.push')}
      </label>
    </div>
  );
}
