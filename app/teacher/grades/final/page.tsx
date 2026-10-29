"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  RefreshCw,
  TrendingUp,
  Award,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type FinalRecord = {
  student_code: string;
  student_name: string | null;
  month1_score: number;
  month2_score: number;
  month3_score: number;
  month1_exam: string;
  month2_exam: string;
  average_months: number;
  final_score: number;
};

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const monthsList = [
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

export default function FinalGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, FinalRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // الفلاتر
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

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

  // تحميل الطلاب + الشهور + الاختبارات
  const loadData = async () => {
    if (!selectedGrade || !selectedClass || !user) return;

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

      // 2. نجهز كل الطلاب
      const finalMap: Record<string, FinalRecord> = {};
      studentsList.forEach((s: Student) => {
        finalMap[s.code] = {
          student_code: s.code,
          student_name: s.full_name,
          month1_score: 0,
          month2_score: 0,
          month3_score: 0,
          month1_exam: "",
          month2_exam: "",
          average_months: 0,
          final_score: 0,
        };
      });

      // 3. نجيب المتوسطات من السجل الشهري لكل شهر
      const monthValues = ["10", "11", "12"];
      for (let i = 0; i < monthValues.length; i++) {
        const month = monthValues[i];
        const res = await fetch(
          `/api/monthly-grades?grade=${selectedGrade}&class=${selectedClass}&month=${month}&subject=${
            user.subject || ""
          }&teacher=${user.code}`
        );
        const data = await res.json();

        if (data.success && data.grades) {
          data.grades.forEach((g: any) => {
            if (finalMap[g.student_code]) {
              if (i === 0) finalMap[g.student_code].month1_score = g.average_score || 0;
              if (i === 1) finalMap[g.student_code].month2_score = g.average_score || 0;
              if (i === 2) finalMap[g.student_code].month3_score = g.average_score || 0;
            }
          });
        }
      }

      // 4. نجيب الاختبارات المحفوظة من final_grades
      const finalRes = await fetch(
        `/api/final-grades?grade=${selectedGrade}&class=${selectedClass}&subject=${
          user.subject || ""
        }&teacher=${user.code}`
      );
      const finalData = await finalRes.json();

      if (finalData.success && finalData.grades) {
        finalData.grades.forEach((g: any) => {
          if (finalMap[g.student_code]) {
            finalMap[g.student_code].month1_exam = g.month1_exam
              ? String(g.month1_exam)
              : "";
            finalMap[g.student_code].month2_exam = g.month2_exam
              ? String(g.month2_exam)
              : "";
          }
        });
      }

      // 5. نحسب متوسط الشهور والمجموع النهائي
      Object.values(finalMap).forEach((r) => {
        const m1 = r.month1_score || 0;
        const m2 = r.month2_score || 0;
        const m3 = r.month3_score || 0;
        const e1 = Number(r.month1_exam) || 0;
        const e2 = Number(r.month2_exam) || 0;

        r.average_months = Math.round(((m1 + m2 + m3) / 3) * 100) / 100;
        r.final_score = Math.round((r.average_months + e1 + e2) * 100) / 100;
      });

      setRecords(finalMap);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGrade, selectedClass]);

  // تحديث اختبار
  const updateExam = (
    studentCode: string,
    field: "month1_exam" | "month2_exam",
    value: string
  ) => {
    let val = value;
    if (Number(val) > 15) val = "15";
    if (Number(val) < 0) val = "0";

    const record = records[studentCode];
    if (!record) return;

    const updated = { ...record, [field]: val };

    // نحسب متوسط الشهور والمجموع النهائي
    const m1 = updated.month1_score || 0;
    const m2 = updated.month2_score || 0;
    const m3 = updated.month3_score || 0;
    const e1 = Number(updated.month1_exam) || 0;
    const e2 = Number(updated.month2_exam) || 0;

    updated.average_months = Math.round(((m1 + m2 + m3) / 3) * 100) / 100;
    updated.final_score =
      Math.round((updated.average_months + e1 + e2) * 100) / 100;

    setRecords({ ...records, [studentCode]: updated });
  };

  // حفظ
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
      const res = await fetch("/api/final-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          class: selectedClass,
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

  // ألوان حسب المجموع النهائي (من 70)
  const getFinalColor = (score: number) => {
    if (score >= 56) return "bg-emerald-100 text-emerald-700";
    if (score >= 35) return "bg-amber-100 text-amber-700";
    if (score > 0) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-400";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allFiltersSelected = selectedGrade && selectedClass;

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                السجل النهائي 🎓
              </h1>
              <p className="text-sm text-gray-500">
                {user.subject
                  ? `مادة ${user.subject}`
                  : "النتيجة النهائية للطالب"}
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
            اختر الصف والفصل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              اختر الصف والفصل عشان تظهر النتائج النهائية
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F4A3F] text-sm">
                  {grades.find((g) => g.value === selectedGrade)?.label} —
                  فصل {selectedClass}
                </p>
                <p className="text-xs text-gray-500">
                  {students.length} طالب • {user.subject || "بدون مادة"} •{" "}
                  الشهور من الشهري، الاختبارات يدوية
                </p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 min-w-[180px]">
                      اسم الطالب
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[80px]">
                      أكتوبر
                      <span className="block text-[10px] font-normal text-amber-600">
                        (40)
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[80px]">
                      نوفمبر
                      <span className="block text-[10px] font-normal text-amber-600">
                        (40)
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[80px]">
                      ديسمبر
                      <span className="block text-[10px] font-normal text-amber-600">
                        (40)
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[110px]">
                      اختبار شهر 1
                      <span className="block text-[10px] font-normal text-purple-600">
                        (15)
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[110px]">
                      اختبار شهر 2
                      <span className="block text-[10px] font-normal text-purple-600">
                        (15)
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px] bg-[#1F4A3F]/5">
                      المجموع
                      <span className="block text-[10px] font-normal text-[#C9A227]">
                        (70)
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

                        {/* Month 1 */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-amber-50 text-amber-700 text-sm">
                            {rec.month1_score}
                          </span>
                        </td>

                        {/* Month 2 */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-amber-50 text-amber-700 text-sm">
                            {rec.month2_score}
                          </span>
                        </td>

                        {/* Month 3 */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-amber-50 text-amber-700 text-sm">
                            {rec.month3_score}
                          </span>
                        </td>

                        {/* Exam 1 */}
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={rec.month1_exam}
                            onChange={(e) =>
                              updateExam(
                                student.code,
                                "month1_exam",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className="w-full px-2 py-2 rounded-xl bg-white border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-center font-bold text-purple-700 transition"
                          />
                        </td>

                        {/* Exam 2 */}
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={rec.month2_exam}
                            onChange={(e) =>
                              updateExam(
                                student.code,
                                "month2_exam",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className="w-full px-2 py-2 rounded-xl bg-white border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-center font-bold text-purple-700 transition"
                          />
                        </td>

                        {/* Final Score */}
                        <td className="px-3 py-3 text-center bg-[#1F4A3F]/5">
                          <span
                            className={`inline-flex items-center justify-center w-16 h-10 rounded-xl font-bold text-lg ${getFinalColor(
                              rec.final_score
                            )}`}
                          >
                            {rec.final_score}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Info Bar */}
            <div className="p-3 border-t border-gray-100 bg-sky-50">
              <p className="text-xs text-sky-800 text-center">
                📊 متوسط الشهور = (أكتوبر + نوفمبر + ديسمبر) ÷ 3 —{" "}
                <strong>من 40</strong> • المجموع = متوسط الشهور + اختبار1 + اختبار2 —{" "}
                <strong>من 70</strong>
              </p>
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
                    حفظ السجل النهائي
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