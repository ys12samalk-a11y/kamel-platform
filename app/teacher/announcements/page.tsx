"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Megaphone,
  ArrowRight,
  Loader2,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bell,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  teacher_code: string | null;
  teacher_name: string | null;
  grade: string | null;
  class: string | null;
  priority: string;
  created_at: string;
};

const grades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const priorities = [
  {
    value: "normal",
    label: "عادي",
    icon: Info,
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  {
    value: "important",
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

export default function TeacherAnnouncementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [priority, setPriority] = useState("normal");

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

  const loadAnnouncements = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/announcements?teacher=${user.code}`);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAnnouncements();
  }, [user]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !body || !grade || !className) {
      setError("الرجاء إكمال كل البيانات");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          teacher_code: user.code,
          teacher_name: user.full_name,
          grade,
          class: className,
          priority,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setPosting(false);
        return;
      }

      setSuccess("تم نشر الإعلان بنجاح! ✅");
      setTitle("");
      setBody("");
      setGrade("");
      setClassName("");
      setPriority("normal");
      loadAnnouncements();

      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الإعلان ده؟")) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriority = (p: string) =>
    priorities.find((pr) => pr.value === p) || priorities[0];

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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Megaphone className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إعلانات الفصل
              </h1>
              <p className="text-sm text-gray-500">
                انشر إعلانات لطلاب فصلك
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-8"
        >
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            نشر إعلان جديد
          </h2>

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                عنوان الإعلان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: امتحان الرياضيات الأسبوع القادم"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                نص الإعلان
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اكتب تفاصيل الإعلان..."
                required
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الصف
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
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
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
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
                  الأهمية
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={posting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {posting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  نشر الإعلان
                </>
              )}
            </button>
          </form>
        </motion.div>

        <div>
          <h2 className="font-bold text-xl text-[#1F4A3F] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إعلاناتي ({announcements.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Megaphone className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                مفيش إعلانات
              </h3>
              <p className="text-gray-500 text-sm">
                ابدأ بنشر أول إعلان لفصلك
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a, i) => {
                const p = getPriority(a.priority);
                const Icon = p.icon;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-[#1F4A3F]">
                            {a.title}
                          </h3>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                          {a.body}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span
                            className={`px-2 py-1 rounded-lg ${p.bg} ${p.text} border ${p.border} font-medium`}
                          >
                            {p.label}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                            {grades.find((g) => g.value === a.grade)?.label} —
                            فصل {a.class}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(a.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}