"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  BookOpen,
  Sparkles,
} from "lucide-react";

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type GradeRecord = {
  student_code: string;
  student_name: string | null;
  assessment_score: string;
  behavior_score: string;
  notebook_score: string;
  notes: string;
};

// القوايم دي للاستخدام في حالة لو المدرس ملوش صلاحيات محددة
const allGrades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const allClasses = Array.from({ length: 15 }, (_, i) => String(i + 1));

const months = [
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

const weeks = [
  { value: "1", label: "الأسبوع الأول" },
  { value: "2", label: "الأسبوع الثاني" },
  { value: "3", label: "الأسبوع الثالث" },
  { value: "4", label: "الأسبوع الرابع" },
];

export default function WeeklyGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradesData, setGradesData] = useState<Record<string, GradeRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // الفلاتر
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  // ✨ الصفوف والفصول المتاحة للمدرس
  const [availableGrades, setAvailableGrades] = useState(allGrades);
  const [availableClasses, setAvailableClasses] = useState(allClasses);

  // ✨ نحفظ grades_classes بتاع المدرس
  const [gradesClasses, setGradesClasses] = useState<Record<string, string[]>>(
    {}
  );

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

            // ✨ نحدد الصفوف المتاحة
            const teacherGrades: string[] = data.user.grades || [];
            if (teacherGrades.length > 0) {
              const filtered = allGrades.filter((g) =>
                teacherGrades.includes(g.value)
              );
              setAvailableGrades(filtered);
            }

            // ✨ نحفظ grades_classes
            const gc: Record<string, string[]> =
              data.user.grades_classes || {};
            setGradesClasses(gc);

            // ✨ لو مفيش صف محدد بعد، نعرض الفصول من grades_classes
            // بس لما الصف يتحدد هنعرض الفصول بتاعته
            if (teacherGrades.length === 0) {
              // لو مفيش صلاحيات محددة، نعرض كل الفصول
              setAvailableClasses(allClasses);
            } else {
              // نعرض فاضي لحد ما الصف يتحدد
              setAvailableClasses([]);
            }
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

  // ✨ لما الصف يتغير، نحدّث الفصول المتاحة
  useEffect(() => {
    if (!selectedGrade) {
      setAvailableClasses([]);
      return;
    }

    // لو الصف ده عنده فصول محددة في grades_classes
    if (gradesClasses[selectedGrade]) {
      const gradeClasses = gradesClasses[selectedGrade] || [];
      const filtered = allClasses.filter((c) => gradeClasses.includes(c));
      setAvailableClasses(filtered);
    } else {
      // لو مفيش، نعرض كل الفصول (الحالة الاحتياطية)
      setAvailableClasses(allClasses);
    }

    // نصفّر الفصل المختار
    setSelectedClass("");
    setStudents([]);
    setGradesData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  // تحميل الطلاب + الدرجات
  const loadData = async () => {
    if (
      !selectedGrade ||
      !selectedClass ||
      !selectedMonth ||
      !selectedWeek ||
      !user
    )
      return;

    setLoading(true);
    setError("");

    try {
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

      const gradesRes = await fetch(
        `/api/weekly-grades?grade=${selectedGrade}&class=${selectedClass}&month=${selectedMonth}&week=${selectedWeek}&subject=${
          user.subject || ""
        }&teacher=${user.code}`
      );
      const gradesApiData = await gradesRes.json();

      const savedGrades: any[] = gradesApiData.success
        ? gradesApiData.grades
        : [];

      const map: Record<string, GradeRecord> = {};
      studentsList.forEach((s: Student) => {
        const saved = savedGrades.find((g) => g.student_code === s.code);
        map[s.code] = {
          student_code: s.code,
          student_name: s.full_name,
          assessment_score: saved ? String(saved.assessment_score) : "",
          behavior_score: saved ? String(saved.behavior_score) : "",
          notebook_score: saved ? String(saved.notebook_score) : "",
          notes: saved?.notes || "",
        };
      });

      setGradesData(map);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade, selectedClass, selectedMonth, selectedWeek]);

  const updateScore = (
    studentCode: string,
    field: keyof GradeRecord,
    value: string
  ) => {
    setGradesData({
      ...gradesData,
      [studentCode]: {
        ...gradesData[studentCode],
        [field]: value,
      },
    });
  };

  const calculateTotal = (record: GradeRecord) => {
    const a = Number(record.assessment_score) || 0;
    const b = Number(record.behavior_score) || 0;
    const n = Number(record.notebook_score) || 0;
    return a + b + n;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!user) return;

    const records = Object.values(gradesData).map((r) => ({
      student_code: r.student_code,
      student_name: r.student_name,
      assessment_score: Number(r.assessment_score) || 0,
      behavior_score: Number(r.behavior_score) || 0,
      notebook_score: Number(r.notebook_score) || 0,
      notes: r.notes || null,
    }));

    if (records.length === 0) {
      setError("مفيش درجات للحفظ");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/weekly-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          class: selectedClass,
          month: selectedMonth,
          week: selectedWeek,
          subject: user.subject || "",
          teacher_code: user.code,
          records,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allFiltersSelected =
    selectedGrade && selectedClass && selectedMonth && selectedWeek;

  const hasLimitedPermissions =
    availableGrades.length < allGrades.length ||
    Object.keys(gradesClasses).length > 0;

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
                السجل الأسبوعي 📅
              </h1>
              <p className="text-sm text-gray-500">
                {user.subject
                  ? `مادة ${user.subject}`
                  : "سجّل درجات طلابك الأسبوعية"}
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

        {/* Info Banner */}
        {hasLimitedPermissions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-sky-50 border border-sky-100 mb-4 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-sky-800 leading-relaxed">
              <strong>ملاحظة:</strong> الفلاتر بتعرض بس الصفوف والفصول اللي
              الإدارة حددتها لك.
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            اختر الصف والفصل والشهر والأسبوع
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الصف
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
              >
                <option value="">اختر الصف</option>
                {availableGrades.map((g) => (
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
                {selectedGrade && (
                  <span className="text-xs text-gray-400 mr-2">
                    ({availableClasses.length} متاح)
                  </span>
                )}
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedGrade}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {!selectedGrade ? "اختر الصف الأول" : "اختر الفصل"}
                </option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    فصل {c}
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

            {/* Week */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                الأسبوع
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
              >
                <option value="">اختر الأسبوع</option>
                {weeks.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
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
              اختر الصف والفصل والشهر والأسبوع عشان تظهر قائمة الطلاب
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        )}

        {/* Grades Table */}
        {!loading && allFiltersSelected && students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden"
          >
            {/* Header Info */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <p className="font-bold text-[#1F4A3F] text-sm">
                  {allGrades.find((g) => g.value === selectedGrade)?.label} —
                  فصل {selectedClass} —{" "}
                  {months.find((m) => m.value === selectedMonth)?.label} —{" "}
                  {weeks.find((w) => w.value === selectedWeek)?.label}
                </p>
                <p className="text-xs text-gray-500">
                  {students.length} طالب • {user.subject || "بدون مادة"}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 min-w-[200px]">
                      اسم الطالب
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[140px]">
                      التقييم
                      <span className="block text-[10px] font-normal text-emerald-600">
                        (من 15)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[140px]">
                      كشكول الحصة
                      <span className="block text-[10px] font-normal text-indigo-600">
                        (من 15)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[140px]">
                      السلوك
                      <span className="block text-[10px] font-normal text-amber-600">
                        (من 10)
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 min-w-[100px] bg-[#1F4A3F]/5">
                      المجموع
                      <span className="block text-[10px] font-normal text-[#C9A227]">
                        (من 40)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, i) => {
                    const record = gradesData[student.code] || {
                      student_code: student.code,
                      student_name: student.full_name,
                      assessment_score: "",
                      behavior_score: "",
                      notebook_score: "",
                      notes: "",
                    };
                    const total = calculateTotal(record);

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

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={record.assessment_score}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (Number(val) > 15) val = "15";
                              if (Number(val) < 0) val = "0";
                              updateScore(
                                student.code,
                                "assessment_score",
                                val
                              );
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none text-center font-bold text-emerald-700 transition"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={record.notebook_score}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (Number(val) > 15) val = "15";
                              if (Number(val) < 0) val = "0";
                              updateScore(student.code, "notebook_score", val);
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none text-center font-bold text-indigo-700 transition"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={record.behavior_score}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (Number(val) > 10) val = "10";
                              if (Number(val) < 0) val = "0";
                              updateScore(student.code, "behavior_score", val);
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none text-center font-bold text-amber-700 transition"
                          />
                        </td>

                        <td className="px-4 py-3 text-center bg-[#1F4A3F]/5">
                          <span
                            className={`inline-flex items-center justify-center w-16 h-10 rounded-xl font-bold text-lg ${
                              total >= 32
                                ? "bg-emerald-100 text-emerald-700"
                                : total >= 20
                                ? "bg-amber-100 text-amber-700"
                                : total > 0
                                ? "bg-rose-100 text-rose-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {total}
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
                    حفظ الدرجات
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