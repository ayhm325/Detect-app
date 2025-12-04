
import DoctorLayout from "../DoctorLayout";
import UploadXRayPageContent from "../../components/doctor/pages/UploadXRayPageContent";

export default function UploadXRayPage() {
  return (
    <DoctorLayout>
      <div className="p-8">
        <UploadXRayPageContent />
      </div>
    </DoctorLayout>
  );
}
