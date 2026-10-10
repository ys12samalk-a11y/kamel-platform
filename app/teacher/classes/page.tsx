"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Loader2,
  GraduationCap,
  User,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

export default function TeacherClassesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

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

  const loadStudents = async () => {
    if (!selectedGrade || !selectedClass) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/students?grade=${selectedGrade}&class=${selectedClass}`
      );
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGrade && selectedClass) loadStudents();
  }, [selectedGrade, selectedClass]);

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
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                قوائم الفصول
              </h1>
              <p className="text-sm text-gray-500">
                اعرض طلاب فصولك
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

        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الصف
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass("");
                  setStudents([]);
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
              >
                <option value="">اختر الصف</option>
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الفصل
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedGrade}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer disabled:opacity-50"
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

          {loading && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
            </div>
          )}
        </div>

        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <h2 className="font-bold text-[#1F4A3F]">
                  {grades.find((g) => g.value === selectedGrade)?.label} —
                  فصل {selectedClass}
                </h2>
                <p className="text-xs text-gray-500">
                  {students.length} طالب
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {students.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1F4A3F] text-sm truncate">
                      {s.full_name || (
                        <span className="text-gray-400 italic">
                          لم يكمل بياناته
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {s.code}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && students.length === 0 && selectedGrade && selectedClass && (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              مفيش طلاب في الفصل
            </h3>
            <p className="text-gray-500 text-sm">
              لسه محدش مسجل في الفصل ده
            </p>
          </div>
        )}
      </div>
    </main>
  );
}