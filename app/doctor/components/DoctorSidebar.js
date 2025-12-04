import React from 'react';
import { FaHome, FaUserInjured, FaXRay, FaComments, FaCalendarAlt, FaChartBar, FaBell, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import styles from './DoctorSidebar.module.css';

const navItems = [
  { label: 'الصفحة الرئيسية', icon: <FaHome />, href: '/doctor/dashboard' },
  { label: 'المرضى', icon: <FaUserInjured />, href: '/doctor/patients' },
  { label: 'الصور الطبية', icon: <FaXRay />, href: '/doctor/results' },
  { label: 'المحادثات', icon: <FaComments />, href: '/doctor/chat' },
  { label: 'المواعيد', icon: <FaCalendarAlt />, href: '/doctor/appointments' },
  { label: 'التحليلات', icon: <FaChartBar />, href: '/doctor/analytics' },
  { label: 'الإشعارات', icon: <FaBell />, href: '/doctor/notifications' },
  { label: 'الإعدادات', icon: <FaCog />, href: '/doctor/settings' },
];

export default function DoctorSidebar({ active }) {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.label} className={active === item.href ? styles.active : ''}>
              <Link href={item.href}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
