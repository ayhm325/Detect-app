export default function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg card-glass p-4 ${className}`}>
      {children}
    </div>
  );
}
