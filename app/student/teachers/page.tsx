"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Loader2,
  Search,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  BookOpen,
  User,
  X,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/subjects";

type Teacher = {
  id: string;
  code: string;
  full_name: string;
  subject: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
};

// نضيف "الكل" في أول القائمة
const subjects = ["الكل", ...ALL_SUBJECTS];

// دالة عشان تحول رقم الموبايل لصيغة واتساب (مصرية)
const formatWhatsApp = (phone: string) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "20" + cleaned.substring(1);
  }
  return cleaned;
};

export default function StudentTeachersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("الكل");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // تحميل بيانات المستخدم
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
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل قائمة المدرسين
  const loadTeachers = async () => {
    try {
      const res = await fetch("/api/teachers-directory");
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers || []);
        setFiltered(data.teachers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTeachers();
  }, [user]);

  // فلترة
  useEffect(() => {
    let result = teachers;

    if (selectedSubject !== "الكل") {
      result = result.filter((t) => t.subject === selectedSubject);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name.toLowerCase().includes(q) ||
          (t.subject && t.subject.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [selectedSubject, searchQuery, teachers]);

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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                دليل المدرسين 👨‍🏫
              </h1>
              <p className="text-sm text-gray-500">
                تعرف على مدرسينك وتواصل معاهم بسهولة
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

        {/* Filters */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المدرس أو المادة..."
              className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSubject === s
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              {searchQuery || selectedSubject !== "الكل"
                ? "مفيش نتائج مطابقة"
                : "لسه مفيش مدرسين"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedSubject !== "الكل"
                ? "جرب تغيير البحث أو الفلتر"
                : "هيظهروا هنا لما الإدارة تضيفهم"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((teacher, i) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setSelectedTeacher(teacher)}
              >
                {/* Avatar */}
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
                    {teacher.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {teacher.full_name?.charAt(0) || <User className="w-10 h-10" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-[#1F4A3F] text-lg mb-1">
                    {teacher.full_name}
                  </h3>
                  {teacher.subject && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <BookOpen className="w-3 h-3" />
                      {teacher.subject}
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center gap-2 pt-3 border-t border-gray-100">
                  {teacher.whatsapp && (
                    <a
                      href={`https://wa.me/${formatWhatsApp(teacher.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition"
                      title="واتساب"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  {teacher.facebook && (
                    <a
                      href={teacher.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                      title="فيسبوك"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {teacher.phone && (
                    <a
                      href={`tel:${teacher.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition"
                      title="اتصال"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center justify-center transition"
                      title="إيميل"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - تفاصيل المدرس */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]">
              <h3 className="font-bold text-xl text-white">
                بيانات المدرس
              </h3>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Avatar */}
              <div className="flex justify-center mb-5">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg ring-4 ring-white">
                  {selectedTeacher.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedTeacher.avatar_url}
                      alt={selectedTeacher.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {selectedTeacher.full_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-6">
                <h4 className="font-bold text-2xl text-[#1F4A3F] mb-1">
                  {selectedTeacher.full_name}
                </h4>
                {selectedTeacher.subject && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    {selectedTeacher.subject}
                  </span>
                )}
              </div>

              {/* Bio */}
              {selectedTeacher.bio && (
                <div className="p-4 rounded-2xl bg-gray-50 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-1">نبذة</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}

              {/* Contact */}
              <div className="space-y-2 mb-6">
                {selectedTeacher.phone && (
                  <a
                    href={`tel:${selectedTeacher.phone}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">الهاتف</p>
                      <p className="font-bold text-[#1F4A3F] text-sm" dir="ltr">
                        {selectedTeacher.phone}
                      </p>
                    </div>
                  </a>
                )}

                {selectedTeacher.whatsapp && (
                  <a
                    href={`https://wa.me/${formatWhatsApp(selectedTeacher.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">واتساب</p>
                      <p className="font-bold text-[#1F4A3F] text-sm" dir="ltr">
                        {selectedTeacher.whatsapp}
                      </p>
                    </div>
                  </a>
                )}

                {selectedTeacher.facebook && (
                  <a
                    href={selectedTeacher.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">فيسبوك</p>
                      <p className="font-bold text-[#1F4A3F] text-sm">
                        صفحة المدرس
                      </p>
                    </div>
                  </a>
                )}

                {selectedTeacher.email && (
                  <a
                    href={`mailto:${selectedTeacher.email}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">الإيميل</p>
                      <p className="font-bold text-[#1F4A3F] text-sm" dir="ltr">
                        {selectedTeacher.email}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* WhatsApp CTA */}
              {selectedTeacher.whatsapp && (
                <a
                  href={`https://wa.me/${formatWhatsApp(selectedTeacher.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  ابعت رسالة واتساب
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}