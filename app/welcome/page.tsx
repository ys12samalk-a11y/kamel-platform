"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  GraduationCap,
  Users,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PartyPopper,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [userCode, setUserCode] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      setUserCode(user.code);
      setRole(user.role);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: userCode,
          full_name: fullName,
          grade,
          class: className,
          phone,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(true);

      setTimeout(() => {
        if (data.user.role === "student") {
          router.push("/student");
        } else if (data.user.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/admin");
        }
      }, 2000);
    } catch (err) {
      setError("حدث خطأ في الاتصال بالسيرفر");
      setLoading(false);
    }
  };

  // شاشة النجاح
  if (success) {
    return (
      <main className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] shadow-2xl mb-6"
          >
            <PartyPopper className="w-12 h-12 text-[#C9A227]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#1F4A3F] mb-3">
            أهلاً بك! 🎉
          </h1>
          <p className="text-gray-600 mb-2">تم حفظ بياناتك بنجاح</p>
          <p className="text-sm text-gray-400">
            جاري تحويلك للوحة التحكم...
          </p>
        </motion.div>
      </main>
    );
  }

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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] shadow-lg shadow-emerald-900/20 mb-5"
          >
            <Sparkles className="w-8 h-8 text-[#C9A227]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#1F4A3F] mb-2">
            أهلاً بك في منصة الحويج
          </h1>
          <p className="text-gray-500 text-sm">
            قبل ما نبدأ، أكمل بياناتك عشان نجهزلك حسابك
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-emerald-900/5"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمد علي"
                  required
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Student-only fields */}
            {role === "student" && (
              <>
                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    الصف
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">اختر الصف</option>
                      <option value="1">الصف الأول الثانوي</option>
                      <option value="2">الصف الثاني الثانوي</option>
                      <option value="3">الصف الثالث الثانوي</option>
                    </select>
                  </div>
                </div>

                {/* Class - 15 فصول */}
                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    الفصل
                  </label>
                  <div className="relative">
                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                      className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">اختر الفصل</option>
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={String(num)}>
                          فصل {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                رقم الموبايل{" "}
                <span className="text-gray-400 text-xs">(اختياري)</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                كلمة السر الجديدة
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 حروف على الأقل"
                  required
                  minLength={6}
                  dir="ltr"
                  className="w-full pr-12 pl-12 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
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
              <p className="text-xs text-gray-400 mt-1.5">
                🔒 غيّر كلمة السر المؤقتة عشان تأمّن حسابك
              </p>
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  حفظ والمتابعة
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          بياناتك محفوظة بأمان في منصة الحويج
        </motion.p>
      </motion.div>
    </main>
  );
}