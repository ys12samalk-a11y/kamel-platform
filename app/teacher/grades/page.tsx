"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ArrowRight,
  Loader2,
  Sparkles,
  Save,
  Users,
  CheckCircle2,
  AlertCircle,
  Trash2,
  GraduationCap,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type Grade = {
  id: string;
  student_code: string;
  student_name: string | null;
  subject: string;
  exam_type: string;
  exam_name: string;
  score: number;
  max_score: number;
  date: string;
  notes: string | null;
  created_at: string;
};

const subjects = [
  "عربي",
  "إنجليزي",
  "رياضيات",
  "علوم",
  "دراسات",
  "دين",
  "حاسب آلي",
];

const examTypes = [
  { value: "weekly", label: "أسبوعي" },
  { value: "monthly", label: "شهري" },
  { value: "midterm", label: "نصف الترم" },
  { value: "final", label: "نهائي" },
  { value: "quiz", label: "اختبار قصير" },
];

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

export default function TeacherGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // فلترة الفصل
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // بيانات الامتحان
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [examName, setExamName] = useState("");
  const [maxScore, setMaxScore] = useState("100");
 const [examDate, setExamDate] = useState("");

useEffect(() => {
  setExamDate(new Date().toISOString().split("T")[0]);
}, []);

  // درجات الطلاب
  const [scores, setScores] = useState<Record<string, string>>({});

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

  // تحميل الدرجات الأخيرة
  const loadRecentGrades = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/grades?teacher=${user.code}`);
      const data = await res.json();
      if (data.success) {
        setRecentGrades(data.grades.slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadRecentGrades();
  }, [user]);

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
        // نصفّر الدرجات
        setScores({});
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
    if (selectedGrade && selectedClass) {
      loadStudents();
    }
  }, [selectedGrade, selectedClass]);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // التحقق
    if (!subject || !examType || !examName) {
      setError("الرجاء اختيار المادة ونوع الامتحان واسمه");
      return;
    }

    const validScores = Object.entries(scores).filter(
      ([_, score]) => score !== ""
    );

    if (validScores.length === 0) {
      setError("الرجاء إدخال درجة واحدة على الأقل");
      return;
    }

    setSaving(true);

    try {
      // حفظ كل درجة
      let savedCount = 0;
      for (const [studentCode, score] of validScores) {
        const student = students.find((s) => s.code === studentCode);
        if (!student) continue;

        const res = await fetch("/api/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_code: studentCode,
            student_name: student.full_name,
            subject,
            teacher_code: user.code,
            exam_type: examType,
            exam_name: examName,
            score: Number(score),
            max_score: Number(maxScore) || 100,
            date: examDate,
          }),
        });

        if (res.ok) savedCount++;
      }

      setSuccess(`تم حفظ ${savedCount} درجة بنجاح! ✅`);
      setScores({});
      setExamName("");
      loadRecentGrades();

      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الدرجة دي؟")) return;
    try {
      const res = await fetch(`/api/grades?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecentGrades(recentGrades.filter((g) => g.id !== id));
      }
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                سجل الدرجات
              </h1>
              <p className="text-sm text-gray-500">
                سجّل درجات طلابك بسهولة
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

        {/* Step 1: Select Class */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
              1
            </span>
            اختر الفصل
          </h2>

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
          </div>

          {students.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              تم تحميل {students.length} طالب في الفصل
            </div>
          )}

          {loading && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
            </div>
          )}
        </div>

        {/* Step 2: Exam Details */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6"
          >
            <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
                2
              </span>
              بيانات الامتحان
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  المادة
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  نوع الامتحان
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">اختر النوع</option>
                  {examTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  اسم الامتحان
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="مثال: امتحان شهر أكتوبر"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الدرجة النهائية
                </label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Enter Grades */}
        {students.length > 0 && subject && examType && examName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6"
          >
            <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
                3
              </span>
              أدخل الدرجات
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1F4A3F] text-sm truncate">
                      {s.full_name || "لم يكمل بياناته"}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {s.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={scores[s.code] || ""}
                      onChange={(e) =>
                        setScores({
                          ...scores,
                          [s.code]: e.target.value,
                        })
                      }
                      placeholder="—"
                      min="0"
                      max={maxScore}
                      className="w-20 px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-center font-bold"
                    />
                    <span className="text-sm text-gray-500">/ {maxScore}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ الدرجات
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Recent Grades */}
        {recentGrades.length > 0 && (
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <h2 className="font-bold text-lg text-[#1F4A3F] mb-4">
              📋 آخر الدرجات المسجلة
            </h2>

            <div className="space-y-2">
              {recentGrades.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1F4A3F] text-sm truncate">
                      {g.student_name || g.student_code}
                    </p>
                    <p className="text-xs text-gray-500">
                      {g.subject} — {g.exam_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1F4A3F]">
                      {g.score}/{g.max_score}
                    </span>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}