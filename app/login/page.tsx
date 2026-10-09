"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // لو محتاج يكمل بياناته
      if (data.needsProfile) {
        router.push("/welcome");
      } else {
        // لو مكمل، حسب نوعه
        if (data.user.role === "student") {
          router.push("/student");
        } else if (data.user.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/admin");
        }
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالسيرفر");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl"
        />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 right-6 group flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-[#1F4A3F] text-sm font-medium hover:bg-white transition-all shadow-sm"
      >
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        الرئيسية
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] shadow-lg shadow-emerald-900/20 mb-5"
          >
            <Sparkles className="w-8 h-8 text-[#C9A227]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#1F4A3F] mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-gray-500 text-sm">
            أدخل الكود وكلمة السر للدخول إلى منصة الحويج
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-emerald-900/5"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الكود المدرسي
              </label>
              <div className="relative">
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="HWG-STU-0001"
                  dir="ltr"
                  required
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                كلمة السر
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  required
                  className="w-full pr-12 pl-12 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#1F4A3F] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  دخول
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            💡 الكود وكلمة السر استلمتهم من إدارة المدرسة
            <br />
            لو مش عارفهم، تواصل مع الإدارة
          </p>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          منصة الحويج — مدرسة الشهيد محمد كامل الحويج
        </motion.p>
      </motion.div>
    </main>
  );
}