"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowRight,
  Loader2,
  BookOpen,
  GraduationCap,
  Clock,
  User,
} from "lucide-react";

type ScheduleItem = {
  id: string;
  grade: string;
  class: string;
  day: string;
  period: number;
  subject: string;
  teacher_name: string | null;
};

const days = [
  { value: "sunday", label: "الأحد", color: "from-rose-400 to-pink-500" },
  { value: "monday", label: "الإثنين", color: "from-emerald-400 to-teal-500" },
  { value: "tuesday", label: "الثلاثاء", color: "from-amber-400 to-orange-500" },
  { value: "wednesday", label: "الأربعاء", color: "from-sky-400 to-blue-500" },
  { value: "thursday", label: "الخميس", color: "from-purple-400 to-indigo-500" },
];

const periods = [1, 2, 3, 4, 5, 6, 7, 8];

// ألوان لكل مادة
const subjectColors: Record<string, string> = {
  "عربي": "from-rose-400 to-pink-500",
  "إنجليزي": "from-sky-400 to-blue-500",
  "رياضيات": "from-emerald-400 to-teal-500",
  "علوم": "from-amber-400 to-orange-500",
  "دراسات": "from-purple-400 to-indigo-500",
  "دين": "from-cyan-400 to-teal-500",
  "حاسب آلي": "from-indigo-400 to-purple-500",
  "أحياء": "from-lime-400 to-green-500",
  "فيزياء": "from-fuchsia-400 to-pink-500",
  "كيمياء": "from-yellow-400 to-amber-500",
};

const getSubjectColor = (subject: string) =>
  subjectColors[subject] || "from-gray-400 to-slate-500";

export default function StudentSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDay, setTodayDay] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "student") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // نحسب اليوم الحالي
  useEffect(() => {
    const dayIndex = new Date().getDay();
    // 0 = الأحد, 1 = الإثنين, 2 = الثلاثاء, 3 = الأربعاء, 4 = الخميس, 5 = الجمعة, 6 = السبت
    const dayMap: Record<number, string> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
    };
    if (dayMap[dayIndex]) {
      setTodayDay(dayMap[dayIndex]);
    }
  }, []);

  const loadSchedule = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/schedule?grade=${user.grade}&class=${user.class}`
      );
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadSchedule();
  }, [user]);

  const getCell = (day: string, period: number) =>
    schedule.find((s) => s.day === day && s.period === period);

  // الحصص النهاردة
  const todaySchedule = todayDay
    ? periods
        .map((p) => ({
          period: p,
          item: getCell(todayDay, p),
        }))
        .filter((x) => x.item)
    : [];

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
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                جدول الحصص 📅
              </h1>
              <p className="text-sm text-gray-500">
                {user.grade === "1" && "الصف الأول الثانوي"}
                {user.grade === "2" && "الصف الثاني الثانوي"}
                {user.grade === "3" && "الصف الثالث الثانوي"}
                {" — "}
                فصل {user.class}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/student")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : schedule.length === 0 ? (
          /* Empty */
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              لسه مفيش جدول
            </h3>
            <p className="text-gray-500 text-sm">
              استنى الإدارة تنشر الجدول
            </p>
          </div>
        ) : (
          <>
            {/* Today Schedule */}
            {todaySchedule.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C9A227]" />
                  حصص النهاردة ({todaySchedule.length} حصة)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {todaySchedule.map((item) => {
                    const subject = item.item!.subject;
                    const teacher = item.item!.teacher_name;
                    const color = getSubjectColor(subject);
                    return (
                      <motion.div
                        key={item.period}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs opacity-80">
                            حصة {item.period}
                          </span>
                          <BookOpen className="w-4 h-4 opacity-80" />
                        </div>
                        <p className="font-bold text-sm mb-1">{subject}</p>
                        {teacher && (
                          <p className="text-xs opacity-80 truncate">
                            {teacher}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Full Schedule - Desktop */}
            <div className="hidden lg:block mb-8">
              <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                الجدول الأسبوعي الكامل
              </h2>

              <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-3 text-right text-xs font-bold text-gray-500 min-w-[70px]">
                          الحصة
                        </th>
                        {days.map((d) => {
                          const isToday = d.value === todayDay;
                          return (
                            <th
                              key={d.value}
                              className={`p-3 text-center text-xs font-bold min-w-[140px] ${
                                isToday
                                  ? "text-[#C9A227] bg-amber-50"
                                  : "text-[#1F4A3F]"
                              }`}
                            >
                              {d.label}
                              {isToday && (
                                <span className="block text-[10px] font-normal text-amber-600 mt-0.5">
                                  النهاردة
                                </span>
                              )}
                            </th>
                          );
                        })}
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
                            const cell = getCell(d.value, period);
                            const isToday = d.value === todayDay;

                            if (!cell) {
                              return (
                                <td
                                  key={d.value}
                                  className={`p-3 text-center ${
                                    isToday ? "bg-amber-50/50" : ""
                                  }`}
                                >
                                  <span className="text-gray-300 text-xs">
                                    —
                                  </span>
                                </td>
                              );
                            }

                            const color = getSubjectColor(cell.subject);

                            return (
                              <td
                                key={d.value}
                                className={`p-2 ${
                                  isToday ? "bg-amber-50/30" : ""
                                }`}
                              >
                                <div
                                  className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}
                                >
                                  <p className="font-bold text-xs mb-0.5">
                                    {cell.subject}
                                  </p>
                                  {cell.teacher_name && (
                                    <p className="text-[10px] opacity-80 truncate">
                                      {cell.teacher_name}
                                    </p>
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
            </div>

            {/* Full Schedule - Mobile */}
            <div className="lg:hidden space-y-4">
              {days.map((d) => {
                const dayCells = periods
                  .map((p) => ({
                    period: p,
                    item: getCell(d.value, p),
                  }))
                  .filter((x) => x.item);

                if (dayCells.length === 0) return null;

                const isToday = d.value === todayDay;

                return (
                  <motion.div
                    key={d.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-3xl bg-white/80 backdrop-blur border shadow-sm ${
                      isToday
                        ? "border-[#C9A227]/40 ring-2 ring-[#C9A227]/20"
                        : "border-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`font-bold text-lg ${
                          isToday ? "text-[#C9A227]" : "text-[#1F4A3F]"
                        }`}
                      >
                        {d.label}
                      </h3>
                      {isToday && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">
                          النهاردة
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {dayCells.map(({ period, item }) => {
                        const color = getSubjectColor(item!.subject);
                        return (
                          <div
                            key={period}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {period}
                            </div>
                            <div
                              className={`w-2 h-8 rounded-full bg-gradient-to-br ${color}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1F4A3F] text-sm">
                                {item!.subject}
                              </p>
                              {item!.teacher_name && (
                                <p className="text-xs text-gray-500 truncate">
                                  {item!.teacher_name}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}