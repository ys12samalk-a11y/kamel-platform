"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Clock,
  Trash2,
  Send,
  Filter,
  MessageCircle,
  X,
} from "lucide-react";

type Complaint = {
  id: string;
  type: string;
  title: string;
  body: string;
  student_code: string | null;
  student_name: string | null;
  grade: string | null;
  class: string | null;
  is_anonymous: boolean;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
};

const typeFilters = [
  { value: "all", label: "الكل" },
  { value: "complaint", label: "شكاوى", icon: AlertTriangle },
  { value: "suggestion", label: "اقتراحات", icon: Lightbulb },
];

const statusFilters = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "reviewed", label: "تمت المراجعة" },
  { value: "resolved", label: "تم الحل" },
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

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal - الرد
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("reviewed");
  const [saving, setSaving] = useState(false);

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

  const loadComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
        setFiltered(data.complaints);
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

  // فلترة
  useEffect(() => {
    let result = complaints;

    if (typeFilter !== "all") {
      result = result.filter((c) => c.type === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    setFiltered(result);
  }, [typeFilter, statusFilter, complaints]);

  // فتح تفاصيل + رد
  const handleOpenComplaint = (c: Complaint) => {
    setSelectedComplaint(c);
    setResponse(c.admin_response || "");
    setNewStatus(c.status === "pending" ? "reviewed" : c.status);
  };

  // حفظ الرد
  const handleSave = async () => {
    if (!selectedComplaint) return;
    setSaving(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedComplaint.id,
          status: newStatus,
          admin_response: response,
        }),
      });

      if (res.ok) {
        setComplaints(
          complaints.map((c) =>
            c.id === selectedComplaint.id
              ? {
                  ...c,
                  status: newStatus,
                  admin_response: response,
                  responded_at: new Date().toISOString(),
                }
              : c
          )
        );
        setSelectedComplaint(null);
        setResponse("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // حذف
  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الرسالة دي؟")) return;

    try {
      const res = await fetch(`/api/complaints?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComplaints(complaints.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // إحصائيات
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    complaints: complaints.filter((c) => c.type === "complaint").length,
    suggestions: complaints.filter((c) => c.type === "suggestion").length,
  };

  const getTypeInfo = (t: string) =>
    t === "complaint"
      ? {
          label: "شكوى",
          icon: AlertTriangle,
          color: "from-rose-400 to-pink-500",
          bg: "bg-rose-50",
          text: "text-rose-700",
        }
      : {
          label: "اقتراح",
          icon: Lightbulb,
          color: "from-amber-400 to-orange-500",
          bg: "bg-amber-50",
          text: "text-amber-700",
        };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة الشكاوى والاقتراحات 💬
              </h1>
              <p className="text-sm text-gray-500">
                اسمع صوت الطلاب ورد عليهم
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.total}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي الرسائل</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.pending}
              </p>
            </div>
            <p className="text-xs text-gray-500">قيد المراجعة</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.complaints}
              </p>
            </div>
            <p className="text-xs text-gray-500">شكاوى</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.suggestions}
              </p>
            </div>
            <p className="text-xs text-gray-500">اقتراحات</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          {/* Type Filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {typeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  typeFilter === f.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === f.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              مفيش رسائل
            </h3>
            <p className="text-gray-500 text-sm">
              جرب تغيير الفلتر
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const t = getTypeInfo(c.type);
              const TypeIcon = t.icon;
              const statusInfo = statuses[c.status] || statuses.pending;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleOpenComplaint(c)}
                  className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-lg transition-all cursor-pointer"
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
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {c.body}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                        <span
                          className={`px-2 py-1 rounded-lg font-medium ${t.bg} ${t.text}`}
                        >
                          {t.label}
                        </span>
                        {c.is_anonymous ? (
                          <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium">
                            مجهول
                          </span>
                        ) : (
                          <span>{c.student_name || c.student_code}</span>
                        )}
                        <span>•</span>
                        <span>{formatDate(c.created_at)}</span>
                        {c.admin_response && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">
                              ✓ تم الرد
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - الرد */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${
                    getTypeInfo(selectedComplaint.type).color
                  } flex items-center justify-center shadow-lg`}
                >
                  {selectedComplaint.type === "complaint" ? (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1F4A3F]">
                    الرد على الرسالة
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getTypeInfo(selectedComplaint.type).label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <p className="text-xs text-gray-500 mb-1">العنوان</p>
                <h4 className="font-bold text-[#1F4A3F]">
                  {selectedComplaint.title}
                </h4>
              </div>

              {/* Sender */}
              <div>
                <p className="text-xs text-gray-500 mb-1">المرسل</p>
                {selectedComplaint.is_anonymous ? (
                  <span className="inline-block px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium">
                    مجهول الهوية
                  </span>
                ) : (
                  <p className="text-sm text-[#1F4A3F] font-medium">
                    {selectedComplaint.student_name || "—"}{" "}
                    <span className="font-mono text-xs text-gray-500">
                      ({selectedComplaint.student_code})
                    </span>
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <p className="text-xs text-gray-500 mb-1">التفاصيل</p>
                <div className="p-4 rounded-2xl bg-gray-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedComplaint.body}
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الحالة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["pending", "reviewed", "resolved"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                        newStatus === s
                          ? "bg-[#1F4A3F] text-white shadow-md"
                          : `${statuses[s].bg} ${statuses[s].color} hover:shadow-sm`
                      }`}
                    >
                      {statuses[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الرد{" "}
                  <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="اكتب ردك للطالب..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    حفظ الرد
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}