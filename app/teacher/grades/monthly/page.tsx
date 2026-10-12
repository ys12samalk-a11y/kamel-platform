"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type MonthlyRecord = {
  student_code: string;
  student_name: string | null;
  week1_score: number;
  week2_score: number;
  week3_score: number;
  week4_score: number;
  average_score: number;
};

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const months = [
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

export default function MonthlyGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, MonthlyRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // الفلاتر
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // تحميل بيانات المستخدم
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

      // نجيب أحدث البيانات من الـ API
      const loadUser = async () => {
        try {
          const res = await fetch(`/api/profile?code=${parsed.code}`);
          const data = await res.json();
          if (data.success) {
            const updated = { ...parsed, ...data.user };
            setUser(updated);
            localStorage.setItem("user", JSON.stringify(updated));
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadUser();
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل الطلاب + الأسابيع الأربعة
  const loadData = async () => {
    if (!selectedGrade || !selectedClass || !selectedMonth || !user) return;

    setLoading(true);
    setError("");

    try {
      // 1. نجيب الطلاب
      const studentsRes = await fetch(
        `/api/teacher/students?grade=${selectedGrade}&class=${selectedClass}`
      );
      const studentsData = await studentsRes.json();

      if (!studentsData.success) {
        setError("فشل تحميل الطلاب");
        setLoading(false);
        return;
      }

      const studentsList = studentsData.students || [];
      setStudents(studentsList);

      // 2. نجيب درجات الأسابيع الأربعة لكل طالب
      const monthlyMap: Record<string, MonthlyRecord> = {};

      // نجهز كل الطلاب في الـ map الأول
      studentsList.forEach((s: Student) => {
        monthlyMap[s.code] = {
          student_code: s.code,
          student_name: s.full_name,
          week1_score: 0,
          week2_score: 0,
          week3_score: 0,
          week4_score: 0,
          average_score: 0,
        };
      });

      // نجيب كل أسبوع
      const weeks = ["1", "2", "3", "4"];
      for (const week of weeks) {
        const res = await fetch(
          `/api/weekly-grades?grade=${selectedGrade}&class=${selectedClass}&month=${selectedMonth}&week=${week}&subject=${
            user.subject || ""
          }&teacher=${user.code}`
        );
        const data = await res.json();

        if (data.success && data.grades) {
          data.grades.forEach((g: any) => {
            if (monthlyMap[g.student_code]) {
              if (week === "1")
                monthlyMap[g.student_code].week1_score = g.total_score || 0;
              if (week === "2")
                monthlyMap[g.student_code].week2_score = g.total_score || 0;
              if (week === "3")
                monthlyMap[g.student_code].week3_score = g.total_score || 0;
              if (week === "4")
                monthlyMap[g.student_code].week4_score = g.total_score || 0;
            }
          });
        }
      }

      // 3. نحسب المتوسط لكل طالب
      Object.values(monthlyMap).forEach((r) => {
        const sum = r.week1_score + r.week2_score + r.week3_score + r.week4_score;
        r.average_score = Math.round((sum / 4) * 100) / 100;
      });

      setRecords(monthlyMap);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGrade, selectedClass, selectedMonth]);

  // حفظ السجل الشهري
  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!user) return;

    const recs = Object.values(records);

    if (recs.length === 0) {
      setError("مفيش بيانات للحفظ");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/monthly-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          class: selectedClass,
          month: selectedMonth,
          subject: user.subject || "",
          teacher_code: user.code,
          records: recs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setSuccess(`تم حفظ ${data.count} سجل بنجاح! ✅`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  // ألوان حسب المتوسط
  const getAverageColor = (avg: number) => {
    if (avg >= 32) return "bg-emerald-100 text-emerald-700";
    if (avg >= 20) return "bg-amber-100 text-amber-700";
    if (avg > 0) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-400";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allFiltersSelected = selectedGrade && selectedClass && selectedMonth;

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <CalendarDays className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                السجل الشهري 📆
              </h1>
              <p className="text-sm text-gray-500">
                {user.subject
                  ? `مادة ${user.subject}`
                  : "متوسط درجات الشهور"}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/teacher/grades")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            اختر الصف والفصل والشهر
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grade */}
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
                  setRecords({});
                }}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
              >
                <option value="">اختر الصف</option>
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الفصل
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedGrade}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">اختر الفصل</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    فصل {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الشهر
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
              >
                <option value="">اختر الشهر</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!allFiltersSelected && (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Filter className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              اختر الفلاتر الأول
            </h3>
            <p className="text-gray-500 text-sm">
              اختر الصف والفصل والشهر عشان تظهر بيانات الشهر
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        )}

        {/* Table */}
        {!loading && allFiltersSelected && students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden"
          >
            {/* Header Info */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F4A3F] text-sm">
                  {grades.find((g) => g.value === selectedGrade)?.label} —
                  فصل {selectedClass} —{" "}
                  {months.find((m) => m.value === selectedMonth)?.label}
                </p>
                <p className="text-xs text-gray-500">
                  {students.length} طالب • {user.subject || "بدون مادة"} •{" "}
                  البيانات بتتنسخ تلقائي من السجل الأسبوعي
                </p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100 transition"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 min-w-[180px]">
                      اسم الطالب
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px]">
                      الأسبوع 1
                      <span className="block text-[10px] font-normal text-emerald-600">
                        (من 40)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px]">
                      الأسبوع 2
                      <span className="block text-[10px] font-normal text-emerald-600">
                        (من 40)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px]">
                      الأسبوع 3
                      <span className="block text-[10px] font-normal text-emerald-600">
                        (من 40)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px]">
                      الأسبوع 4
                      <span className="block text-[10px] font-normal text-emerald-600">
                        (من 40)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[110px] bg-amber-50">
                      المتوسط
                      <span className="block text-[10px] font-normal text-amber-700">
                        (من 40)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, i) => {
                    const rec = records[student.code];
                    if (!rec) return null;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="px-4 py-3 text-center text-sm text-gray-400">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1F4A3F] text-sm">
                            {student.full_name || (
                              <span className="text-gray-400 italic">
                                لم يكمل بياناته
                              </span>
                            )}
                          </p>
                          <p className="font-mono text-[10px] text-gray-400">
                            {student.code}
                          </p>
                        </td>

                        {/* Week 1 */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                            {rec.week1_score}
                          </span>
                        </td>

                        {/* Week 2 */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                            {rec.week2_score}
                          </span>
                        </td>

                        {/* Week 3 */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                            {rec.week3_score}
                          </span>
                        </td>

                        {/* Week 4 */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                            {rec.week4_score}
                          </span>
                        </td>

                        {/* Average */}
                        <td className="px-4 py-3 text-center bg-amber-50/50">
                          <span
                            className={`inline-flex items-center justify-center w-16 h-10 rounded-xl font-bold text-lg ${getAverageColor(
                              rec.average_score
                            )}`}
                          >
                            {rec.average_score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Messages */}
            {(error || success) && (
              <div className="p-4 border-t border-gray-100">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    حفظ السجل الشهري
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* No Students */}
        {!loading && allFiltersSelected && students.length === 0 && (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-gray-400" />
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