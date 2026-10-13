"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  ArrowRight,
  Loader2,
  Search,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  AlertTriangle,
  Clock,
  User,
  GraduationCap,
  Filter,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  subject?: string;
  grades_classes?: Record<string, string[]>;
};

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

type LogEntry = {
  id: string;
  student_code: string;
  student_name: string | null;
  subject: string | null;
  message: string;
  type: string;
  sent_count: number;
  created_at: string;
};

const types = [
  {
    value: "info",
    label: "عادي",
    icon: Info,
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  {
    value: "warning",
    label: "مهم",
    icon: AlertTriangle,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  {
    value: "urgent",
    label: "عاجل",
    icon: AlertCircle,
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
];

const gradeLabels: Record<string, string> = {
  "1": "أولى ثانوي",
  "2": "تانية ثانوي",
  "3": "تالتة ثانوي",
};

export default function TeacherNotifyParentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // الفلاتر
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // فورم الإرسال
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      // نجيب أحدث بيانات المدرس
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

  // تحميل الصفوف المتاحة للمدرس
  const availableGrades = (() => {
    if (!user?.grades_classes) return [];
    return Object.keys(user.grades_classes);
  })();

  const availableClasses = (() => {
    if (!selectedGrade || !user?.grades_classes) return [];
    return user.grades_classes[selectedGrade] || [];
  })();

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
        setStudents(data.students || []);
        setFiltered(data.students || []);
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

  // تحميل سجل الإشعارات
  const loadLogs = async () => {
    if (!user) return;
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/teacher/notify-parent?teacher=${user.code}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  // إرسال الإشعار
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("اختر طالب الأول");
      return;
    }
    if (!message.trim()) {
      setError("اكتب رسالة");
      return;
    }
    if (!user) return;

    setError("");
    setSuccess("");
    setSending(true);

    try {
      const res = await fetch("/api/teacher/notify-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_code: selectedStudent.code,
          teacher_code: user.code,
          teacher_name: user.full_name,
          subject,
          message,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSending(false);
        return;
      }

      setSuccess(`✅ ${data.message}`);
      setSubject("");
      setMessage("");
      setType("info");
      setSelectedStudent(null);

      // نعيد تحميل السجل
      loadLogs();

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSending(false);
    }
  };

  const getTypeInfo = (val: string) =>
    types.find((t) => t.value === val) || types[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);

    if (diff < 1) return "الآن";
    if (diff < 60) return `قبل ${diff} دقيقة`;
    if (diff < 1440) return `قبل ${Math.floor(diff / 60)} ساعة`;
    if (diff < 10080) return `قبل ${Math.floor(diff / 1440)} يوم`;
    return d.toLocaleDateString("ar-EG");
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إرسال إشعار لولي الأمر 📩
              </h1>
              <p className="text-sm text-gray-500">
                ابعت رسالة لولي أمر طالب
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Student */}
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
              <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
                  1
                </span>
                اختر الطالب
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      setSelectedStudent(null);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
                  >
                    <option value="">اختر الصف</option>
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        {gradeLabels[g] || `صف ${g}`}
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
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedStudent(null);
                    }}
                    disabled={!selectedGrade}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">اختر الفصل</option>
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        فصل {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search */}
              {students.length > 0 && (
                <div className="relative mb-4">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالكود أو الاسم..."
                    className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                  />
                </div>
              )}

              {/* Students List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
                </div>
              ) : students.length === 0 && selectedGrade && selectedClass ? (
                <div className="p-6 rounded-2xl bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    مفيش طلاب في الفصل ده
                  </p>
                </div>
              ) : filtered.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudent(s)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                        selectedStudent?.code === s.code
                          ? "bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          selectedStudent?.code === s.code
                            ? "bg-white/20"
                            : "bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white"
                        }`}
                      >
                        {s.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {s.full_name || "لم يكمل بياناته"}
                        </p>
                        <p
                          className={`font-mono text-xs ${
                            selectedStudent?.code === s.code
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {s.code}
                        </p>
                      </div>
                      {selectedStudent?.code === s.code && (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Step 2: Message Form */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
              >
                <h2 className="font-bold text-lg text-[#1F4A3F] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#1F4A3F] text-white text-sm flex items-center justify-center">
                    2
                  </span>
                  اكتب الإشعار
                </h2>

                {/* Selected Student Info */}
                <div className="p-3 rounded-2xl bg-[#1F4A3F]/5 border border-[#1F4A3F]/10 mb-4 flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-[#1F4A3F]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1F4A3F] text-sm">
                      {selectedStudent.full_name || "لم يكمل بياناته"}
                    </p>
                    <p className="font-mono text-xs text-gray-500">
                      {selectedStudent.code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    تغيير
                  </button>
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      الموضوع{" "}
                      <span className="text-gray-400 text-xs">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: بخصوص الحضور"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      الرسالة
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب رسالتك لولي الأمر..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      نوع الإشعار
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {types.map((t) => {
                        const Icon = t.icon;
                        const isActive = type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all ${
                              isActive
                                ? `bg-gradient-to-br ${t.color} text-white shadow-md`
                                : `${t.bg} ${t.text} border ${t.border} hover:shadow-sm`
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
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

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        إرسال الإشعار
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          {/* Right: Logs */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-[#1F4A3F] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C9A227]" />
                  سجل الإشعارات
                </h3>
                <span className="text-xs text-gray-500">
                  {logs.length} إشعار
                </span>
              </div>

              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="p-6 rounded-2xl bg-gray-50 text-center">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    لسه مبعتش أي إشعارات
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => {
                    const t = getTypeInfo(log.type);
                    const Icon = t.icon;
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-2xl bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${t.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#1F4A3F] text-xs truncate">
                              {log.student_name || log.student_code}
                            </p>
                            {log.subject && (
                              <p className="text-[10px] text-gray-500 truncate">
                                {log.subject}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {log.message}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{formatDate(log.created_at)}</span>
                          <span className="px-2 py-0.5 rounded bg-white">
                            {log.sent_count} ولي أمر
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}