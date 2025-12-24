"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorDashboardWrapper({ children }) {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return children;
}
