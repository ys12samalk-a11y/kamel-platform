"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowRight,
  Loader2,
  Users,
  GraduationCap,
  TrendingUp,
  CalendarDays,
  Award,
  User,
} from "lucide-react";

type Child = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type WeeklyGrade = {
  id: string;
  subject: string;
  month: string;
  week: string;
  assessment_score: number;
  behavior_score: number;
  notebook_score: number;
  total_score: number;
  created_at: string;
};

type MonthlyGrade = {
  id: string;
  subject: string;
  month: string;
  week1_score: number;
  week2_score: number;
  week3_score: number;
  week4_score: number;
  average_score: number;
  created_at: string;
};

type FinalGrade = {
  id: string;
  subject: string;
  month1_score: number;
  month2_score: number;
  month3_score: number;
  month1_exam: number;
  month2_exam: number;
  average_months: number;
  final_score: number;
  created_at: string;
};

export default function ParentGradesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentParam = searchParams.get("student");

  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<WeeklyGrade[]>([]);
  const [monthly, setMonthly] = useState<MonthlyGrade[]>([]);
  const [final, setFinal] = useState<FinalGrade[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "final">(
    "final"
  );
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المستخدم
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "parent") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل قائمة الأبناء
  useEffect(() => {
    if (!user) return;
    const loadChildren = async () => {
      try {
        const res = await fetch(`/api/parent/students?parent=${user.code}`);
        const data = await res.json();
        if (data.success) {
          setChildren(data.students || []);
          // لو فيه student في الـ URL، نختاره
          if (studentParam && data.students.some((s: Child) => s.code === studentParam)) {
            setSelectedChild(studentParam);
          } else if (data.students.length > 0) {
            setSelectedChild(data.students[0].code);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, [user, studentParam]);

  // تحميل الدرجات لما نختار ابن
  useEffect(() => {
    if (!user || !selectedChild) return;
    const loadGrades = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/parent/grades?parent=${user.code}&student=${selectedChild}`
        );
        const data = await res.json();
        if (data.success) {
          setWeekly(data.grades.weekly || []);
          setMonthly(data.grades.monthly || []);
          setFinal(data.grades.final || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGrades();
  }, [user, selectedChild]);

  const monthLabel = (m: string) => {
    if (m === "10") return "أكتوبر";
    if (m === "11") return "نوفمبر";
    if (m === "12") return "ديسمبر";
    return m;
  };

  const weekLabel = (w: string) => {
    return `الأسبوع ${w}`;
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 85) return "bg-emerald-100 text-emerald-700";
    if (pct >= 60) return "bg-amber-100 text-amber-700";
    if (pct > 0) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-400";
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                درجات الأبناء 📊
              </h1>
              <p className="text-sm text-gray-500">
                تابع درجات أبنائك بالتفصيل
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/parent")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
            <label className="block text-sm font-medium text-[#1F4A3F] mb-3">
              اختر الابن
            </label>
            <div className="flex gap-2 flex-wrap">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChild(c.code)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    selectedChild === c.code
                      ? "bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedChild === c.code
                        ? "bg-white/20"
                        : "bg-white text-[#1F4A3F]"
                    }`}
                  >
                    {c.full_name?.charAt(0) || "?"}
                  </div>
                  {c.full_name || c.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("final")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "final"
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg"
                : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-white"
            }`}
          >
            <Award className="w-4 h-4" />
            السجل النهائي
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "monthly"
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg"
                : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-white"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            السجل الشهري
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === "weekly"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            السجل الأسبوعي
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : !selectedChild ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">اختر ابن لعرض درجاته</p>
          </div>
        ) : (
          <>
            {/* Final Grades */}
            {activeTab === "final" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden"
              >
                {final.length === 0 ? (
                  <div className="p-12 text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لسه مفيش درجات نهائية</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">
                            المادة
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            متوسط الشهور
                            <span className="block text-[10px] font-normal text-amber-600">
                              (من 40)
                            </span>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            اختبار 1
                            <span className="block text-[10px] font-normal text-purple-600">
                              (من 15)
                            </span>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            اختبار 2
                            <span className="block text-[10px] font-normal text-purple-600">
                              (من 15)
                            </span>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 bg-[#1F4A3F]/5">
                            المجموع
                            <span className="block text-[10px] font-normal text-[#C9A227]">
                              (من 70)
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {final.map((g) => (
                          <tr key={g.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-4 font-bold text-[#1F4A3F]">
                              {g.subject}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-amber-50 text-amber-700">
                                {g.average_months}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-purple-50 text-purple-700">
                                {g.month1_exam}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold bg-purple-50 text-purple-700">
                                {g.month2_exam}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center bg-[#1F4A3F]/5">
                              <span
                                className={`inline-flex items-center justify-center w-16 h-10 rounded-xl font-bold text-lg ${getScoreColor(
                                  g.final_score,
                                  70
                                )}`}
                              >
                                {g.final_score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* Monthly Grades */}
            {activeTab === "monthly" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden"
              >
                {monthly.length === 0 ? (
                  <div className="p-12 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لسه مفيش درجات شهرية</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">
                            المادة
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            الشهر
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            أسبوع 1
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            أسبوع 2
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            أسبوع 3
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">
                            أسبوع 4
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 bg-amber-50">
                            المتوسط
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {monthly.map((g) => (
                          <tr key={g.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-4 font-bold text-[#1F4A3F]">
                              {g.subject}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-600">
                              {monthLabel(g.month)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                                {g.week1_score}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                                {g.week2_score}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                                {g.week3_score}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-10 rounded-xl font-bold bg-gray-50 text-gray-700">
                                {g.week4_score}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center bg-amber-50/50">
                              <span
                                className={`inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold ${getScoreColor(
                                  g.average_score,
                                  40
                                )}`}
                              >
                                {g.average_score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* Weekly Grades */}
            {activeTab === "weekly" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {weekly.length === 0 ? (
                  <div className="col-span-full p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لسه مفيش درجات أسبوعية</p>
                  </div>
                ) : (
                  weekly.map((g) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[#1F4A3F]">
                          {g.subject}
                        </h3>
                        <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                          {monthLabel(g.month)} — {weekLabel(g.week)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded-xl bg-emerald-50">
                          <p className="text-xs text-emerald-600 mb-1">تقييم</p>
                          <p className="font-bold text-emerald-700">
                            {g.assessment_score}
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-amber-50">
                          <p className="text-xs text-amber-600 mb-1">سلوك</p>
                          <p className="font-bold text-amber-700">
                            {g.behavior_score}
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-indigo-50">
                          <p className="text-xs text-indigo-600 mb-1">كشكول</p>
                          <p className="font-bold text-indigo-700">
                            {g.notebook_score}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          المجموع (من 40)
                        </span>
                        <span
                          className={`inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold ${getScoreColor(
                            g.total_score,
                            40
                          )}`}
                        >
                          {g.total_score}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}