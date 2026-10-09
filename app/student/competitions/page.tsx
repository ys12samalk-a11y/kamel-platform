"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowRight,
  Loader2,
  Users,
  Calendar,
  Gift,
  Crown,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";

type Competition = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  prize: string | null;
  deadline: string | null;
  status: string;
  entries_count?: number;
  created_at: string;
};

const statuses = [
  { value: "open", label: "مفتوحة", color: "bg-emerald-100 text-emerald-700" },
  { value: "closed", label: "مغلقة", color: "bg-gray-100 text-gray-700" },
  { value: "finished", label: "منتهية", color: "bg-amber-100 text-amber-700" },
];

export default function StudentCompetitionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [myEntries, setMyEntries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const loadCompetitions = async () => {
    try {
      const res = await fetch("/api/competitions");
      const data = await res.json();
      if (data.success) {
        setCompetitions(data.competitions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // نشوف الاشتراكات
  const loadMyEntries = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/competitions");
      const data = await res.json();
      if (!data.success) return;

      const entriesSet = new Set<string>();
      for (const comp of data.competitions) {
        const detailRes = await fetch(`/api/competitions?id=${comp.id}`);
        const detail = await detailRes.json();
        if (detail.success) {
          const mine = detail.entries.find(
            (e: any) => e.student_code === user.code
          );
          if (mine) entriesSet.add(comp.id);
        }
      }
      setMyEntries(entriesSet);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompetitions();
      loadMyEntries();
    }
  }, [user]);

  // اشتراك
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;
    setError("");
    setSuccess("");

    setSubmitting(true);

    try {
      const res = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competition_id: selectedComp.id,
          student_code: user.code,
          student_name: user.full_name,
          grade: user.grade,
          class: user.class,
          submission_text: submissionText,
          submission_url: submissionUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSubmitting(false);
        return;
      }

      setSuccess("تم اشتراكك في المسابقة! 🎉");
      setMyEntries(new Set([...myEntries, selectedComp.id]));

      setTimeout(() => {
        setSuccess("");
        setSelectedComp(null);
        setSubmissionText("");
        setSubmissionUrl("");
      }, 2000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                المسابقات 🏆
              </h1>
              <p className="text-sm text-gray-500">
                شارك واكسب جوائز قيمة
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

        {/* Competitions */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : competitions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              لسه مفيش مسابقات
            </h3>
            <p className="text-gray-500 text-sm">
              استنى الإدارة تنشر مسابقات جديدة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitions.map((c, i) => {
              const statusInfo =
                statuses.find((s) => s.value === c.status) || statuses[0];
              const isJoined = myEntries.has(c.id);
              const isOpen = c.status === "open";

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-xl transition-all"
                >
                  {/* Joined Badge */}
                  {isJoined && (
                    <div className="absolute -top-2 -left-2 px-3 py-1 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      مشترك
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-[#1F4A3F] mb-2">
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {c.description}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.prize && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                        <Gift className="w-3 h-3" />
                        {c.prize}
                      </span>
                    )}
                    {c.deadline && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                        <Calendar className="w-3 h-3" />
                        {formatDate(c.deadline)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {c.entries_count || 0} مشترك
                    </span>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setSelectedComp(c)}
                    disabled={!isOpen}
                    className={`w-full py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      !isOpen
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isJoined
                        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                        : "bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white hover:shadow-lg"
                    }`}
                  >
                    {!isOpen ? (
                      <>المسابقة مغلقة</>
                    ) : isJoined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        مشترك بالفعل
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        اشترك الآن
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - اشتراك */}
      {selectedComp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1F4A3F]">
                    {selectedComp.title}
                  </h3>
                  <p className="text-xs text-gray-500">اشترك في المسابقة</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Description */}
              <div className="p-4 rounded-2xl bg-gray-50 mb-5">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedComp.description}
                </p>
              </div>

              {/* Info */}
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedComp.prize && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-medium">
                    <Gift className="w-3 h-3" />
                    الجائزة: {selectedComp.prize}
                  </span>
                )}
                {selectedComp.deadline && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    آخر موعد: {formatDate(selectedComp.deadline)}
                  </span>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    وصف العمل{" "}
                    <span className="text-gray-400 text-xs">(اختياري)</span>
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="اشرح عملك بإيجاز..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    رابط العمل{" "}
                    <span className="text-gray-400 text-xs">(اختياري)</span>
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                  />
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
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الاشتراك...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      تأكيد الاشتراك
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}