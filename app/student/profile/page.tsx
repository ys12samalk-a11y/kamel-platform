"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Key,
  School,
  Calendar,
  Shield,
  Mail,
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "student") {
        router.push("/login");
        return;
      }
      setUser(parsed);

      // نجيب أحدث البيانات من Supabase
      const load = async () => {
        try {
          const res = await fetch(`/api/profile?code=${parsed.code}`);
          const data = await res.json();
          if (data.success) {
            setForm({
              full_name: data.user.full_name || "",
              phone: data.user.phone || "",
              newPassword: "",
              confirmPassword: "",
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      load();
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.full_name.trim()) {
      setError("الاسم مطلوب");
      return;
    }

    if (form.newPassword) {
      if (form.newPassword.length < 6) {
        setError("كلمة السر لازم تكون 6 حروف على الأقل");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError("كلمتين السر مش متطابقتين");
        return;
      }
    }

    setSaving(true);

    try {
      const updates: any = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
      };

      if (form.newPassword) {
        updates.password = form.newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: user.code, updates }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      // نحدّث localStorage
      const updatedUser = {
        ...user,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess("تم تحديث البيانات بنجاح! ✅");
      setForm({ ...form, newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                الملف الشخصي 👤
              </h1>
              <p className="text-sm text-gray-500">
                بياناتك وحسابك
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/student")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white mb-6 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A227]/10 blur-3xl" />

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C9A227] to-[#E0BC3E] flex items-center justify-center text-[#1F4A3F] font-bold text-3xl shadow-2xl">
              {user.full_name?.charAt(0) || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-1">
                {form.full_name || user.full_name || "طالب"}
              </h2>
              <p className="text-white/70 text-sm mb-2">
                {user.code}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C9A227]/20 text-[#C9A227] text-xs font-medium">
                  <School className="w-3 h-3" />
                  {user.grade === "1" && "أولى ثانوي"}
                  {user.grade === "2" && "تانية ثانوي"}
                  {user.grade === "3" && "تالتة ثانوي"}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C9A227]/20 text-[#C9A227] text-xs font-medium">
                  <User className="w-3 h-3" />
                  فصل {user.class}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
        >
          <h3 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            تعديل البيانات
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Code (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الكود المدرسي
              </label>
              <div className="relative">
                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={user.code}
                  disabled
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 outline-none cursor-not-allowed text-left font-mono"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                🔒 الكود مش ممكن يتغير
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  placeholder="اسمك الكامل"
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                رقم الموبايل{" "}
                <span className="text-gray-400 text-xs">(اختياري)</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            <p className="text-xs text-gray-500">
              🔒 اترك الحقول دي فاضية لو مش عايز تغير كلمة السر
            </p>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                كلمة السر الجديدة
              </label>
              <div className="relative">
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  placeholder="6 حروف على الأقل"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                تأكيد كلمة السر
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="أعد كتابتها"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>
            </div>

            {/* Messages */}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التعديلات
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-3xl bg-sky-50 border border-sky-100 mt-6"
        >
          <p className="text-sm text-sky-800 leading-relaxed">
            💡 <strong>ملاحظة:</strong> لو نسيت كلمة السر، كلم الإدارة عشان
            يدوك كلمة سر جديدة.
          </p>
        </motion.div>
      </div>
    </main>
  );
}