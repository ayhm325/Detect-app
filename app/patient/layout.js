import React from 'react';

export const metadata = {
  title: 'Patient',
};

export default function PatientLayout({ children }) {
  // Force patient area color token and provide a full-viewport wrapper
  const style = {
    // set the token so derived UI surfaces use this background
    '--color-background': '#DFF2E5',
    // ensure a visible background behind inner cards
    backgroundColor: '#DFF2E5',
    minHeight: '100vh',
  };

  return (
    <div style={style} className="min-h-screen">
      {children}
    </div>
  );
}
