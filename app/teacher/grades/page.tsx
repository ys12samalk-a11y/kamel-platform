"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ArrowRight,
  Calendar,
  CalendarDays,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  subject?: string;
};

const gradeOptions = [
  {
    value: "weekly",
    label: "السجل الأسبوعي",
    desc: "درجات كل أسبوع على حدة",
    icon: Calendar,
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    href: "/teacher/grades/weekly",
  },
  {
    value: "monthly",
    label: "السجل الشهري",
    desc: "متوسط درجات الشهور",
    icon: CalendarDays,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    href: "/teacher/grades/monthly",
  },
  {
    value: "final",
    label: "السجل النهائي",
    desc: "النتيجة النهائية للطالب",
    icon: GraduationCap,
    color: "from-purple-400 to-indigo-500",
    bg: "bg-purple-50",
    href: "/teacher/grades/final",
  },
];

export default function TeacherGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "teacher") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                سجل الدرجات 📋
              </h1>
              <p className="text-sm text-gray-500">
                اختر نوع السجل اللي عايز تفتحه
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/teacher")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white mb-8 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A227]/10 blur-3xl" />

          <div className="relative flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#C9A227]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-1">
                أهلاً، أ. {user.full_name || "مدرس"} 👋
              </h2>
              <p className="text-white/70 text-sm">
                {user.subject ? `مدرس ${user.subject}` : "اختر السجل اللي محتاجه"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C9A227]/20 text-[#C9A227] text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {user.code}
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
          اختر نوع السجل
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {gradeOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.a
                key={opt.value}
                href={opt.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative p-7 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all overflow-hidden"
              >
                {/* Background Glow */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${opt.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                    {opt.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    {opt.desc}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-[#1F4A3F] text-sm font-medium group-hover:text-[#C9A227] transition">
                    <span>افتح السجل</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform rotate-180" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-5 rounded-3xl bg-sky-50 border border-sky-100">
          <p className="text-sm text-sky-800 leading-relaxed">
            💡 <strong>ملاحظة:</strong> كل سجل ليه بياناته الخاصة. السجل الأسبوعي
            هو الأساس — منه بتتنسخ الدرجات تلقائيًا للسجل الشهري، ومنه للسجل
            النهائي.
          </p>
        </div>
      </div>
    </main>
  );
}