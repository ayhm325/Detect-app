import LoginForm from "../components/LoginForm";
import LoginSide from "../components/LoginSide";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-linear-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* الديكور على اليمين */}
      <div className="w-full md:w-1/2 h-72 md:h-auto order-2 md:order-1 flex items-stretch justify-center relative p-4">
        <LoginSide />
        {/* زر الهوم في منتصف الفاصل السفلي */}
        <div className="hidden md:flex absolute left-full -translate-x-1/2 bottom-8 z-40">
          <Link href="/ar" className="w-20 h-20 flex items-center justify-center bg-linear-to-br from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 text-white text-4xl rounded-full shadow-2xl border-4 border-yellow-400/40 hover:border-red-400/40 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-400/60">
            <FaHome className="text-5xl drop-shadow-lg" />
            <span className="sr-only">العودة للرئيسية</span>
          </Link>
        </div>
      </div>
      {/* الفورم على اليسار */}
      <div className="w-full md:w-1/2 h-auto order-1 md:order-2 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
