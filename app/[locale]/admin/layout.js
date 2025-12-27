import AuthGuard from "../../components/AuthGuard";
import AdminLayout from "./AdminLayout";

export default function AdminLayoutWrapper({ children }) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
