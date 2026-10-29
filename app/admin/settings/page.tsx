"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  User,
  Bell,
  Shield,
  Key,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // الإعدادات العامة
  const [settings, setSettings] = useState({
    platform_name: "",
    platform_description: "",
    school_name: "",
    school_address: "",
    school_phone: "",
    school_email: "",
  });

  // الملف الشخصي
  const [profile, setProfile] = useState({
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
      if (parsed.role !== "admin") {
        router.push("/login");
        return;
      }
      setUser(parsed);
      setProfile({
        full_name: parsed.full_name || "",
        phone: parsed.phone || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل الإعدادات
  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings({
          platform_name: data.settings.platform_name || "",
          platform_description: data.settings.platform_description || "",
          school_name: data.settings.school_name || "",
          school_address: data.settings.school_address || "",
          school_phone: data.settings.school_phone || "",
          school_email: data.settings.school_email || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  // حفظ الإعدادات
  const handleSaveSettings = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setSuccess("تم حفظ الإعدادات بنجاح! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  // تحديث الملف الشخصي
  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");

    if (!profile.full_name.trim()) {
      setError("الاسم مطلوب");
      return;
    }

    if (profile.newPassword) {
      if (profile.newPassword.length < 6) {
        setError("كلمة السر لازم تكون 6 حروف على الأقل");
        return;
      }
      if (profile.newPassword !== profile.confirmPassword) {
        setError("كلمتين السر مش متطابقتين");
        return;
      }
    }

    setSaving(true);

    try {
      const updates: any = {
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim() || null,
      };

      if (profile.newPassword) {
        updates.password = profile.newPassword;
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, updates }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      // نحدّث الـ localStorage
      const updatedUser = {
        ...user,
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim() || null,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSuccess("تم تحديث البيانات بنجاح! ✅");
      setProfile({ ...profile, newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 3000);
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

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                الإعدادات ⚙️
              </h1>
              <p className="text-sm text-gray-500">
                إعدادات المنصة والملف الشخصي
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Section 1: Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#1F4A3F]">
                الملف الشخصي
              </h2>
              <p className="text-xs text-gray-500">
                بياناتك كمسؤول للمنصة
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="اسمك"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  رقم الموبايل
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2" />

            <p className="text-xs text-gray-500">
              🔒 اترك الحقول دي فاضية لو مش عايز تغير كلمة السر
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  كلمة السر الجديدة
                </label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profile.newPassword}
                    onChange={(e) =>
                      setProfile({ ...profile, newPassword: e.target.value })
                    }
                    placeholder="6 حروف على الأقل"
                    dir="ltr"
                    className="w-full pr-12 pl-12 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
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

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  تأكيد كلمة السر
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={profile.confirmPassword}
                  onChange={(e) =>
                    setProfile({ ...profile, confirmPassword: e.target.value })
                  }
                  placeholder="أعد كتابتها"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  تحديث الملف الشخصي
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Section 2: Platform Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#1F4A3F]">
                إعدادات المنصة
              </h2>
              <p className="text-xs text-gray-500">
                الاسم والوصف اللي هيظهروا للزوار
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                اسم المنصة
              </label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) =>
                  setSettings({ ...settings, platform_name: e.target.value })
                }
                placeholder="منصة الحويج"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                وصف المنصة
              </label>
              <textarea
                value={settings.platform_description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    platform_description: e.target.value,
                  })
                }
                placeholder="وصف مختصر للمنصة..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Section 3: School Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#1F4A3F]">
                معلومات المدرسة
              </h2>
              <p className="text-xs text-gray-500">
                بيانات التواصل الرسمية
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                اسم المدرسة
              </label>
              <input
                type="text"
                value={settings.school_name}
                onChange={(e) =>
                  setSettings({ ...settings, school_name: e.target.value })
                }
                placeholder="اسم المدرسة"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                العنوان
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.school_address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      school_address: e.target.value,
                    })
                  }
                  placeholder="عنوان المدرسة"
                  className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  رقم التليفون
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.school_phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        school_phone: e.target.value,
                      })
                    }
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.school_email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        school_email: e.target.value,
                      })
                    }
                    placeholder="email@school.com"
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Save Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                جاري حفظ الإعدادات...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                حفظ كل الإعدادات
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            💡 الإعدادات بتتحفظ تلقائيًا في قاعدة البيانات
          </p>
        </motion.div>
      </div>
    </main>
  );
}