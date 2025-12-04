import LoginForm from "../components/LoginForm";
import LoginSide from "../components/LoginSide";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full h-screen bg-zinc-50 dark:bg-black">
      {/* الديكور على اليمين */}
      <div className="w-full md:w-1/2 h-72 md:h-full order-2 md:order-1 flex items-center justify-center relative">
        <LoginSide />
        {/* زر الهوم في منتصف الفاصل السفلي */}
        <div className="hidden md:flex absolute left-full -translate-x-1/2 bottom-8 z-40">
          <Link href="/ar" className="w-20 h-20 flex items-center justify-center bg-linear-to-br from-cyan-400 via-blue-600 to-purple-700 text-white text-4xl rounded-full shadow-2xl border-4 border-cyan-400/40 hover:from-cyan-500 hover:to-blue-900 hover:via-purple-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-400/60">
            <FaHome className="text-5xl drop-shadow-lg" />
            <span className="sr-only">العودة للرئيسية</span>
          </Link>
        </div>
      </div>
      {/* الفورم على اليسار */}
      <div className="w-full md:w-1/2 h-full order-1 md:order-2 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
