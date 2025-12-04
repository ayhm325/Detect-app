"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    // Clear admin session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
    }
    // Redirect to homepage
    router.replace("/ar");
  }, [router]);
  return null;
}
