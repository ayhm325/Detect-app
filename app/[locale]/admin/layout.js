import AuthGuard from "../../components/AuthGuard";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <section className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        {children}
      </section>
    </AuthGuard>
  );
}
