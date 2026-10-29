"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Loader2,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Users,
} from "lucide-react";

type ScheduleCell = {
  day: string;
  period: number;
  subject: string;
  teacher_name: string;
};

const days = [
  { value: "sunday", label: "الأحد" },
  { value: "monday", label: "الإثنين" },
  { value: "tuesday", label: "الثلاثاء" },
  { value: "wednesday", label: "الأربعاء" },
  { value: "thursday", label: "الخميس" },
];

const periods = [1, 2, 3, 4, 5, 6, 7, 8];

const subjects = [
  "عربي",
  "إنجليزي",
  "رياضيات",
  "علوم",
  "دراسات",
  "دين",
  "حاسب آلي",
  "أحياء",
  "فيزياء",
  "كيمياء",
  "فراغ",
];

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

export default function AdminSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // الجدول: key = "day-period", value = {subject, teacher_name}
  const [schedule, setSchedule] = useState<Record<string, ScheduleCell>>({});

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
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل الجدول
  const loadSchedule = async () => {
    if (!selectedGrade || !selectedClass) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/schedule?grade=${selectedGrade}&class=${selectedClass}`
      );
      const data = await res.json();
      if (data.success) {
        const map: Record<string, ScheduleCell> = {};
        data.schedule.forEach((s: any) => {
          map[`${s.day}-${s.period}`] = {
            day: s.day,
            period: s.period,
            subject: s.subject,
            teacher_name: s.teacher_name || "",
          };
        });
        setSchedule(map);
      }
    } catch (err) {
      setError("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGrade && selectedClass) loadSchedule();
  }, [selectedGrade, selectedClass]);

  // تحديث خلية
  const updateCell = (
    day: string,
    period: number,
    field: "subject" | "teacher_name",
    value: string
  ) => {
    const key = `${day}-${period}`;
    const existing = schedule[key] || {
      day,
      period,
      subject: "",
      teacher_name: "",
    };

    setSchedule({
      ...schedule,
      [key]: { ...existing, [field]: value },
    });
  };

  // حفظ
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // نحول الـ schedule لمصفوفة، ونشيل الفراغات
    const cells: ScheduleCell[] = [];
    Object.values(schedule).forEach((cell) => {
      if (cell.subject && cell.subject !== "فراغ") {
        cells.push(cell);
      }
    });

    setSaving(true);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          class: selectedClass,
          schedule: cells,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setSuccess(`تم حفظ ${data.count} حصة بنجاح! ✅`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  // مسح الجدول كامل
  const handleClear = async () => {
    if (!confirm("متأكد إنك عايز تمسح الجدول كامل؟")) return;

    try {
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          class: selectedClass,
          schedule: [],
        }),
      });
      setSchedule({});
      setSuccess("تم مسح الجدول");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                جدول الحصص 📅
              </h1>
              <p className="text-sm text-gray-500">
                أنشئ جدول كل فصل
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

        {/* Select Class */}
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
                  setSchedule({});
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

        {/* Schedule Grid */}
        {selectedGrade && selectedClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Info */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-700 text-sm mb-4">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>
                املأ الحصص واضغط "حفظ الجدول" — الحصص الفاضية مش هتتحفظ
              </span>
            </div>

            {/* Table */}
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-3 text-right text-xs font-bold text-gray-500 min-w-[80px]">
                        الحصة
                      </th>
                      {days.map((d) => (
                        <th
                          key={d.value}
                          className="p-3 text-center text-xs font-bold text-[#1F4A3F] min-w-[140px]"
                        >
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr
                        key={period}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="p-3 bg-gray-50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-sm mx-auto">
                            {period}
                          </div>
                        </td>
                        {days.map((d) => {
                          const key = `${d.value}-${period}`;
                          const cell = schedule[key] || {
                            day: d.value,
                            period,
                            subject: "",
                            teacher_name: "",
                          };
                          return (
                            <td key={key} className="p-2">
                              <div className="space-y-1.5">
                                <select
                                  value={cell.subject}
                                  onChange={(e) =>
                                    updateCell(
                                      d.value,
                                      period,
                                      "subject",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-xs cursor-pointer"
                                >
                                  <option value="">—</option>
                                  {subjects.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                {cell.subject && cell.subject !== "فراغ" && (
                                  <input
                                    type="text"
                                    value={cell.teacher_name}
                                    onChange={(e) =>
                                      updateCell(
                                        d.value,
                                        period,
                                        "teacher_name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="اسم المدرس"
                                    className="w-full px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-xs"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
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

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 min-w-[200px] py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ الجدول
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                className="px-6 py-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 font-medium hover:bg-rose-100 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                مسح الجدول
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {(!selectedGrade || !selectedClass) && !loading && (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              اختر الصف والفصل
            </h3>
            <p className="text-gray-500 text-sm">
              عشان تبدأ في إنشاء الجدول
            </p>
          </div>
        )}
      </div>
    </main>
  );
}