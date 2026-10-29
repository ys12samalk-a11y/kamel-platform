"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Download,
  Trash2,
  BookOpen,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/subjects";

type Assessment = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  week: string | null;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  download_count: number;
  created_at: string;
};

const grades = [
  { value: "1", label: "الصف الأول الثانوي" },
  { value: "2", label: "الصف الثاني الثانوي" },
  { value: "3", label: "الصف الثالث الثانوي" },
];

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [week, setWeek] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

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

  const loadAssessments = async () => {
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAssessments();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploading(true);

    if (!file) {
      setError("الرجاء اختيار ملف");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("grade", grade);
      formData.append("week", week);
      formData.append("description", description);

      const res = await fetch("/api/assessments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setUploading(false);
        return;
      }

      setSuccess("تم رفع التقييم بنجاح! ✅");
      // Reset form
      setTitle("");
      setSubject("");
      setGrade("");
      setWeek("");
      setDescription("");
      setFile(null);
      // Reload
      loadAssessments();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("متأكد إنك عايز تمسح التقييم ده؟")) return;

    try {
      const res = await fetch(`/api/assessments?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssessments(assessments.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة التقييمات
              </h1>
              <p className="text-sm text-gray-500">
                ارفع التقييمات الأسبوعية للطلاب
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

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-emerald-900/5 mb-8"
        >
          <h2 className="font-bold text-xl text-[#1F4A3F] mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع تقييم جديد
          </h2>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  عنوان التقييم
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: التقييم الأسبوعي الثالث"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              {/* Grade */}
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

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  المادة
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">اختر المادة</option>
                  {ALL_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الأسبوع <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  placeholder="مثال: الأسبوع الثالث"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  وصف <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للتقييم..."
                  rows={2}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                />
              </div>

              {/* File */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الملف (PDF أو صورة)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,image/*"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      file
                        ? "border-[#1F4A3F] bg-[#1F4A3F]/5"
                        : "border-gray-300 hover:border-[#C9A227] hover:bg-amber-50/50"
                    }`}
                  >
                    {file ? (
                      <>
                        <FileText className="w-6 h-6 text-[#1F4A3F]" />
                        <div className="flex-1">
                          <p className="font-medium text-[#1F4A3F] text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700 text-sm">
                            اضغط لاختيار ملف
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF أو صورة — الحد الأقصى 50MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  رفع التقييم
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Assessments List */}
        <div>
          <h2 className="font-bold text-xl text-[#1F4A3F] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            التقييمات المرفوعة ({assessments.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#1F4A3F] animate-spin" />
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">لسه مفيش تقييمات مرفوعة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1F4A3F] mb-1">
                        {a.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                          {a.subject}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700">
                          {grades.find((g) => g.value === a.grade)?.label ||
                            `صف ${a.grade}`}
                        </span>
                        {a.week && (
                          <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700">
                            {a.week}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id, a.file_url)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {a.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {a.download_count} تحميل
                    </span>
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1F4A3F] hover:text-[#C9A227] font-medium"
                    >
                      عرض الملف →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}