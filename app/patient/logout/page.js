"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientLogoutPage() {
  const router = useRouter();
  useEffect(() => {
    // Clear any auth tokens/data here if needed
    localStorage.clear();
    sessionStorage.clear();
    router.replace("/ar");
  }, [router]);
  return null;
}
