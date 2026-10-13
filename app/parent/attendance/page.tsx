"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

type Child = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type AttendanceRecord = {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  notes: string | null;
  teacher_code: string | null;
};

type Stats = {
  total: number;
  present: number;
  absent: number;
  late: number;
};

const statuses = [
  {
    value: "present",
    label: "حاضر",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    value: "late",
    label: "متأخر",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    value: "absent",
    label: "غايب",
    icon: XCircle,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
];

export default function ParentAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentParam = searchParams.get("student");

  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });
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
          if (
            studentParam &&
            data.students.some((s: Child) => s.code === studentParam)
          ) {
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

  // تحميل سجل الحضور
  useEffect(() => {
    if (!user || !selectedChild) return;
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/parent/attendance?parent=${user.code}&student=${selectedChild}`
        );
        const data = await res.json();
        if (data.success) {
          setRecords(data.attendance || []);
          setStats(data.stats || { total: 0, present: 0, absent: 0, late: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [user, selectedChild]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatus = (val: string) =>
    statuses.find((s) => s.value === val) || statuses[0];

  const attendanceRate =
    stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

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
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                غياب الأبناء 📅
              </h1>
              <p className="text-sm text-gray-500">
                تابع حضور وغياب أبنائك
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : !selectedChild ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">اختر ابن لعرض سجل غيابه</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#1F4A3F]">
                    {stats.total}
                  </p>
                </div>
                <p className="text-xs text-gray-500">إجمالي الأيام</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.present}
                  </p>
                </div>
                <p className="text-xs text-gray-500">أيام حضور</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.late}
                  </p>
                </div>
                <p className="text-xs text-gray-500">أيام تأخير</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-rose-600">
                    {stats.absent}
                  </p>
                </div>
                <p className="text-xs text-gray-500">أيام غياب</p>
              </motion.div>
            </div>

            {/* Attendance Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white mb-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#C9A227]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">نسبة الحضور</h3>
                    <p className="text-white/60 text-xs">
                      حضور والتأخير من إجمالي الأيام
                    </p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-[#C9A227]">
                  {attendanceRate}%
                </p>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${attendanceRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#E0BC3E]"
                />
              </div>
            </motion.div>

            {/* Records */}
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
              📋 سجل الحضور ({records.length})
            </h3>

            {records.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
                <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لسه مفيش سجل حضور</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((r, i) => {
                  const s = getStatus(r.status);
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-md transition flex items-center gap-4"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${s.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1F4A3F] text-sm">
                          {formatDate(r.date)}
                        </p>
                        {r.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {r.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${s.bg} ${s.color} border ${s.border}`}
                      >
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}