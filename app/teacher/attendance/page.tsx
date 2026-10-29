"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  Users,
  Save,
  AlertCircle,
  Search,
  Calendar,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type AttendanceRecord = {
  student_code: string;
  student_name: string | null;
  status: "present" | "absent" | "late";
};

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const statuses = [
  {
    value: "present",
    label: "حاضر",
    icon: CheckCircle2,
    color: "emerald",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    solid: "bg-emerald-500",
  },
  {
    value: "late",
    label: "متأخر",
    icon: Clock,
    color: "amber",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    solid: "bg-amber-500",
  },
  {
    value: "absent",
    label: "غايب",
    icon: XCircle,
    color: "rose",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    solid: "bg-rose-500",
  },
];

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");

  // الحالة لكل طالب
  const [attendance, setAttendance] = useState<Record<string, string>>({});

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

  // تحميل الطلاب
  const loadStudents = async () => {
    if (!selectedGrade || !selectedClass) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/teacher/students?grade=${selectedGrade}&class=${selectedClass}`
      );
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setFiltered(data.students);
        setAttendance({});
      } else {
        setError("فشل تحميل الطلاب");
      }
    } catch (err) {
      setError("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGrade && selectedClass) loadStudents();
  }, [selectedGrade, selectedClass]);

  // فلترة البحث
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(students);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          (s.full_name && s.full_name.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, students]);

  // تعيين حالة
  const setStatus = (studentCode: string, status: string) => {
    setAttendance({ ...attendance, [studentCode]: status });
  };

  // تعيين الكل
  const markAll = (status: string) => {
    const all: Record<string, string> = {};
    students.forEach((s) => {
      all[s.code] = status;
    });
    setAttendance(all);
  };

  // حفظ
  const handleSave = async () => {
    setError("");
    setSuccess("");

    const filled = Object.keys(attendance).length;
    if (filled === 0) {
      setError("الرجاء تسجيل حضور طالب واحد على الأقل");
      return;
    }

    setSaving(true);

    try {
      const records: AttendanceRecord[] = Object.entries(attendance).map(
        ([studentCode, status]) => {
          const student = students.find((s) => s.code === studentCode);
          return {
            student_code: studentCode,
            student_name: student?.full_name || null,
            status: status as "present" | "absent" | "late",
          };
        }
      );

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          date,
          grade: selectedGrade,
          class: selectedClass,
          teacher_code: user.code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setSuccess(`تم حفظ حضور ${data.count} طالب بنجاح! ✅`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  // إحصائيات
  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    total: students.length,
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">سجل الغياب</h1>
              <p className="text-sm text-gray-500">
                سجّل حضور وغياب طلابك بسهولة
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

        {/* Step 1: Select */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
              1
            </span>
            اختر الفصل والتاريخ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
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
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">اختر الفصل</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={String(num)}>
                    فصل {num}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
            </div>
          )}

          {students.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              تم تحميل {students.length} طالب
            </div>
          )}
        </div>

        {/* Attendance */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.present}
                </p>
                <p className="text-xs text-gray-500 mt-1">حاضر</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {stats.late}
                </p>
                <p className="text-xs text-gray-500 mt-1">متأخر</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center">
                <p className="text-2xl font-bold text-rose-600">
                  {stats.absent}
                </p>
                <p className="text-xs text-gray-500 mt-1">غايب</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center">
                <p className="text-2xl font-bold text-gray-400">
                  {stats.total - stats.present - stats.late - stats.absent}
                </p>
                <p className="text-xs text-gray-500 mt-1">لم يسجل</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-medium text-[#1F4A3F]">
                  إجراءات سريعة:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => markAll("present")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    ✅ الكل حاضر
                  </button>
                  <button
                    onClick={() => markAll("absent")}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition border border-rose-200"
                  >
                    ❌ الكل غايب
                  </button>
                  <button
                    onClick={() => setAttendance({})}
                    className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 transition border border-gray-200"
                  >
                    🔄 إعادة
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بكود أو اسم الطالب..."
                  className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Students */}
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden mb-4">
              <div className="divide-y divide-gray-100">
                {filtered.map((s, i) => {
                  const current = attendance[s.code];
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="p-4 hover:bg-gray-50/50 transition"
                    >
                      <div className="flex items-center gap-4 flex-wrap">
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

                        {/* Status Buttons */}
                        <div className="flex gap-2">
                          {statuses.map((st) => {
                            const Icon = st.icon;
                            const isActive = current === st.value;
                            return (
                              <button
                                key={st.value}
                                onClick={() => setStatus(s.code, st.value)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                  isActive
                                    ? `${st.solid} text-white shadow-md`
                                    : `${st.bg} ${st.text} border ${st.border} hover:shadow-sm`
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                {st.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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

            {/* Save Button */}
            <button
              onClick={handleSave}
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
                  حفظ الحضور
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}