
import DoctorLayout from "../DoctorLayout";
import DashboardHome from "./DashboardHome";

const breadcrumbs = [
  { label: "الصفحة الرئيسية", href: "/doctor/dashboard" }
];

export default function DoctorDashboard() {
  return (
    <DoctorLayout breadcrumbs={breadcrumbs}>
      <DashboardHome />
    </DoctorLayout>
  );
}
