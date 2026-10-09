"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ArrowRight,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  MessageCircle,
} from "lucide-react";

type Complaint = {
  id: string;
  type: string;
  title: string;
  body: string;
  is_anonymous: boolean;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
};

const types = [
  {
    value: "complaint",
    label: "شكوى",
    icon: AlertTriangle,
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  {
    value: "suggestion",
    label: "اقتراح",
    icon: Lightbulb,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
];

const statuses: Record<string, { label: string; color: string; bg: string }> = {
  pending: {
    label: "قيد المراجعة",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  reviewed: {
    label: "تمت المراجعة",
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
  resolved: {
    label: "تم الحل",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
};

export default function StudentComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

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

  const loadComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?student=${user.code}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !body.trim()) {
      setError("الرجاء إدخال العنوان والتفاصيل");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          body,
          student_code: user.code,
          student_name: user.full_name,
          grade: user.grade,
          class: user.class,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSubmitting(false);
        return;
      }

      setSuccess(
        isAnonymous
          ? "تم إرسال الشكوى بشكل مجهول! ✅"
          : "تم إرسال الشكوى بنجاح! ✅"
      );
      setTitle("");
      setBody("");
      setIsAnonymous(false);
      loadComplaints();

      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  const getType = (val: string) =>
    types.find((t) => t.value === val) || types[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                الشكاوى والاقتراحات 💬
              </h1>
              <p className="text-sm text-gray-500">
                صوتك مسموع — كلمنا بحرية
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-8"
        >
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A227]" />
            اكتب رسالتك
          </h2>

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {types.map((t) => {
              const Icon = t.icon;
              const isActive = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${t.color} text-white shadow-lg`
                      : `${t.bg} ${t.text} border ${t.border} hover:shadow-sm`
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/20" : "bg-white/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-xs opacity-80">
                      {t.value === "complaint"
                        ? "عندك مشكلة؟"
                        : "عندك فكرة؟"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                العنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === "complaint"
                    ? "مثال: مشكلة في دورة المياه"
                    : "مثال: اقتراح إضافة نادي برمجة"
                }
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                التفاصيل
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="اشرح بالتفصيل..."
                required
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Anonymous */}
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isAnonymous
                  ? "bg-purple-50 border-purple-200"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isAnonymous
                      ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                      : "bg-gray-200"
                  }`}
                >
                  {isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#1F4A3F]">
                    إرسال مجهول
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAnonymous
                      ? "اسمك مش هيظهر للإدارة"
                      : "اسمك هيظهر للإدارة"}
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-all relative ${
                  isAnonymous ? "bg-purple-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                    isAnonymous ? "right-0.5" : "right-6.5"
                  }`}
                />
              </div>
            </button>

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
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* My Complaints */}
        <div>
          <h2 className="font-bold text-xl text-[#1F4A3F] mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            رسائلي السابقة ({complaints.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                لسه مفيش رسائل
              </h3>
              <p className="text-gray-500 text-sm">
                ابدأ بإرسال شكوى أو اقتراح
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c, i) => {
                const t = getType(c.type);
                const TypeIcon = t.icon;
                const statusInfo = statuses[c.status] || statuses.pending;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-bold text-[#1F4A3F]">
                            {c.title}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                          {c.body}
                        </p>

                        {/* Admin Response */}
                        {c.admin_response && (
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 mb-3">
                            <p className="text-xs font-bold text-emerald-800 mb-1">
                              💬 رد الإدارة:
                            </p>
                            <p className="text-sm text-emerald-700 whitespace-pre-wrap">
                              {c.admin_response}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                          {c.is_anonymous && (
                            <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium">
                              مجهول
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(c.created_at)}
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