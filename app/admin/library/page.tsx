"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  Loader2,
  Upload,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Filter,
  GraduationCap,
} from "lucide-react";

type LibraryFile = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  download_count: number;
  created_at: string;
};

const subjects = [
  "عربي",
  "إنجليزي",
  "رياضيات",
  "علوم",
  "دراسات",
  "دين",
  "حاسب آلي",
  "أحياء",
  "فيزياء",
  "كيمياء",
];

const grades = [
  { value: "1", label: "الصف الأول الثانوي" },
  { value: "2", label: "الصف الثاني الثانوي" },
  { value: "3", label: "الصف الثالث الثانوي" },
];

export default function AdminLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [filtered, setFiltered] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
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

  const loadFiles = async () => {
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
        setFiltered(data.files);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadFiles();
  }, [user]);

  // فلترة
  useEffect(() => {
    let result = files;

    if (gradeFilter !== "all") {
      result = result.filter((f) => f.grade === gradeFilter);
    }

    if (subjectFilter !== "all") {
      result = result.filter((f) => f.subject === subjectFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [gradeFilter, subjectFilter, searchQuery, files]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file || !title || !subject || !grade) {
      setError("الرجاء إكمال كل البيانات واختيار ملف");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("subject", subject);
      formData.append("grade", grade);
      formData.append("uploaded_by", user.code);

      const res = await fetch("/api/library/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setUploading(false);
        return;
      }

      setSuccess("تم رفع الملف بنجاح! ✅");
      setTitle("");
      setDescription("");
      setSubject("");
      setGrade("");
      setFile(null);
      loadFiles();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الملف ده؟")) return;

    try {
      const res = await fetch(`/api/library?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(files.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة المكتبة 📚
              </h1>
              <p className="text-sm text-gray-500">
                ارفع ملفات ومذكرات للطلاب
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
          className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-8"
        >
          <h2 className="font-bold text-lg text-[#1F4A3F] mb-5 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع ملف جديد
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  عنوان الملف
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مذكرة الرياضيات - الترم الأول"
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
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
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
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  وصف{" "}
                  <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للملف..."
                  rows={2}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none resize-none"
                />
              </div>

              {/* File */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الملف (PDF, Word, PowerPoint, صور)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                    className="hidden"
                    id="library-file"
                  />
                  <label
                    htmlFor="library-file"
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
                            {formatSize(file.size)}
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
                            الحد الأقصى 50MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
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
                  رفع الملف
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Filters */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الملفات..."
              className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setGradeFilter("all")}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                gradeFilter === "all"
                  ? "bg-[#1F4A3F] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              كل الصفوف
            </button>
            {grades.map((g) => (
              <button
                key={g.value}
                onClick={() => setGradeFilter(g.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  gradeFilter === g.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setSubjectFilter("all")}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                subjectFilter === "all"
                  ? "bg-[#1F4A3F] text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              كل المواد
            </button>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  subjectFilter === s
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              {searchQuery || gradeFilter !== "all" || subjectFilter !== "all"
                ? "مفيش نتائج مطابقة"
                : "لسه مفيش ملفات"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || gradeFilter !== "all" || subjectFilter !== "all"
                ? "جرب تغيير الفلتر أو البحث"
                : "ابدأ برفع أول ملف"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1F4A3F] mb-1 truncate">
                      {f.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                        {f.subject}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700">
                        {grades.find((g) => g.value === f.grade)?.label ||
                          `صف ${f.grade}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {f.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {f.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatSize(f.file_size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {f.download_count}
                    </span>
                  </div>
                  <a
                    href={f.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1F4A3F] hover:text-[#C9A227] font-medium transition"
                  >
                    عرض الملف →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}