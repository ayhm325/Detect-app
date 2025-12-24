"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const protectedPrefixes = ["/admin", "/doctor", "/patient"];
    if (protectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
      router.refresh();
    }
  }, [pathname, router]);
  return children;
}
