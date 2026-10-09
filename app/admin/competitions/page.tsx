"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowRight,
  Loader2,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Users,
  Calendar,
  Award,
  Crown,
  Lock,
  Unlock,
  ExternalLink,
  Gift,
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

type Entry = {
  id: string;
  student_code: string;
  student_name: string | null;
  grade: string | null;
  class: string | null;
  submission_text: string | null;
  submission_url: string | null;
  is_winner: boolean;
  created_at: string;
};

const categories = [
  { value: "programming", label: "برمجة" },
  { value: "design", label: "تصميم" },
  { value: "art", label: "رسم" },
  { value: "writing", label: "كتابة" },
  { value: "science", label: "علوم" },
  { value: "general", label: "عام" },
];

const statuses = [
  { value: "open", label: "مفتوحة", color: "bg-emerald-100 text-emerald-700" },
  { value: "closed", label: "مغلقة", color: "bg-gray-100 text-gray-700" },
  { value: "finished", label: "منتهية", color: "bg-amber-100 text-amber-700" },
];

export default function AdminCompetitionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal - إنشاء
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [prize, setPrize] = useState("");
  const [deadline, setDeadline] = useState("");

  // Modal - تفاصيل
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "admin") {
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

  useEffect(() => {
    if (user) loadCompetitions();
  }, [user]);

  // إنشاء مسابقة
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description) {
      setError("الرجاء إدخال العنوان والوصف");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          prize,
          deadline,
          created_by: user.code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setPosting(false);
        return;
      }

      setSuccess("تم إنشاء المسابقة بنجاح! 🎉");
      setTitle("");
      setDescription("");
      setCategory("general");
      setPrize("");
      setDeadline("");
      loadCompetitions();

      setTimeout(() => {
        setSuccess("");
        setShowModal(false);
      }, 2000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setPosting(false);
    }
  };

  // حذف
  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تمسح المسابقة؟ كل الاشتراكات هتتمسح معاها.")) return;

    try {
      const res = await fetch(`/api/competitions?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCompetitions(competitions.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // تغيير الحالة
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/competitions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: { status } }),
      });
      if (res.ok) {
        setCompetitions(
          competitions.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // فتح تفاصيل المسابقة
  const handleOpenDetails = async (comp: Competition) => {
    setSelectedComp(comp);
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/competitions?id=${comp.id}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEntriesLoading(false);
    }
  };

  // إعلان فائز
  const handleWinner = async (entryId: string, currentWinner: boolean) => {
    try {
      const res = await fetch("/api/competitions/join", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId, is_winner: !currentWinner }),
      });
      if (res.ok) {
        setEntries(
          entries.map((e) =>
            e.id === entryId ? { ...e, is_winner: !currentWinner } : e
          )
        );
      }
    } catch (err) {
      console.error(err);
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
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة المسابقات 🏆
              </h1>
              <p className="text-sm text-gray-500">
                أنشئ مسابقات وتابع المشاركين
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-bold hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              مسابقة جديدة
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </button>
          </div>
        </div>

        {/* Competitions List */}
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
            <p className="text-gray-500 text-sm mb-4">
              ابدأ بإنشاء أول مسابقة
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              مسابقة جديدة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitions.map((c, i) => {
              const statusInfo =
                statuses.find((s) => s.value === c.status) || statuses[0];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color} mb-2`}
                      >
                        {statusInfo.label}
                      </span>
                      <h3 className="font-bold text-lg text-[#1F4A3F] mb-1">
                        {c.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
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

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenDetails(c)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-sm font-medium hover:shadow-lg transition"
                    >
                      عرض المشتركين
                    </button>
                    {c.status === "open" ? (
                      <button
                        onClick={() => handleStatusChange(c.id, "closed")}
                        title="إغلاق"
                        className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(c.id, "open")}
                        title="فتح"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - إنشاء */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1F4A3F]">
                    مسابقة جديدة
                  </h3>
                  <p className="text-xs text-gray-500">
                    املأ بيانات المسابقة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  عنوان المسابقة
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مسابقة أفضل موقع ويب"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الوصف
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح تفاصيل المسابقة..."
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    التصنيف
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                    الجائزة
                  </label>
                  <input
                    type="text"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    placeholder="مثال: 500 جنيه"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  آخر موعد
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
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
                disabled={posting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    إنشاء المسابقة
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal - تفاصيل المسابقة */}
      {selectedComp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-[#1F4A3F]">
                  {selectedComp.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {entries.length} مشترك
                </p>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {entriesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#1F4A3F] animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لسه مفيش مشتركين</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className={`p-4 rounded-2xl border transition ${
                        e.is_winner
                          ? "bg-amber-50 border-amber-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            e.is_winner
                              ? "bg-gradient-to-br from-amber-400 to-orange-500"
                              : "bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]"
                          }`}
                        >
                          {e.is_winner ? (
                            <Crown className="w-5 h-5 text-white" />
                          ) : (
                            <Users className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1F4A3F] text-sm">
                            {e.student_name || "طالب"}
                          </p>
                          <p className="font-mono text-xs text-gray-500 mb-2">
                            {e.student_code}
                          </p>
                          {e.submission_text && (
                            <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">
                              {e.submission_text}
                            </p>
                          )}
                          {e.submission_url && (
                            <a
                              href={e.submission_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#C9A227] hover:text-[#1F4A3F] font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              عرض العمل
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleWinner(e.id, e.is_winner)}
                          title={e.is_winner ? "إلغاء الفوز" : "إعلان فائز"}
                          className={`p-2 rounded-lg transition ${
                            e.is_winner
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          }`}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}