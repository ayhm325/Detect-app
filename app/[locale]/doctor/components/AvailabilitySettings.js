import React from 'react';
import styles from './AvailabilitySettings.module.css';
import { useTranslations } from 'next-intl';

export default function AvailabilitySettings({ value, onChange }) {
  const t = useTranslations('doctorSettings');

  return (
    <div className={styles.availability}>
      <h3>{t('doctorSettings.availability.header')}</h3>
      <label>
        {t('doctorSettings.availability.workDays')}:
        <input
          type="text"
          value={value.days || ''}
          onChange={e => onChange({ ...value, days: e.target.value })}
          placeholder={t('doctorSettings.availability.exampleDays')}
        />
      </label>
      <label>
        {t('doctorSettings.availability.startTime')}:
        <input
          type="time"
          value={value.start || ''}
          onChange={e => onChange({ ...value, start: e.target.value })}
        />
      </label>
      <label>
        {t('doctorSettings.availability.endTime')}:
        <input
          type="time"
          value={value.end || ''}
          onChange={e => onChange({ ...value, end: e.target.value })}
        />
      </label>
    </div>
  );
}
