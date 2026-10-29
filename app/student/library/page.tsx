"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
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
  "الكل",
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

const gradeNames: Record<string, string> = {
  "1": "الصف الأول",
  "2": "الصف الثاني",
  "3": "الصف الثالث",
};

export default function StudentLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [filtered, setFiltered] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("الكل");

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

  const loadFiles = async () => {
    if (!user) return;
    try {
      // نجيب ملفات صف الطالب بس
      const res = await fetch(`/api/library?grade=${user.grade}`);
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

    if (selectedSubject !== "الكل") {
      result = result.filter((f) => f.subject === selectedSubject);
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
  }, [selectedSubject, searchQuery, files]);

  const handleDownload = async (file: LibraryFile) => {
    try {
      await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: file.id }),
      });
    } catch (err) {
      console.error(err);
    }
    window.open(file.file_url, "_blank");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return {
        icon: FileText,
        color: "from-rose-400 to-pink-500",
      };
    }
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) {
      return {
        icon: Presentation,
        color: "from-amber-400 to-orange-500",
      };
    }
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      return {
        icon: FileSpreadsheet,
        color: "from-emerald-400 to-teal-500",
      };
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return {
        icon: FileText,
        color: "from-sky-400 to-blue-500",
      };
    }
    if (fileType.includes("image")) {
      return {
        icon: ImageIcon,
        color: "from-purple-400 to-indigo-500",
      };
    }
    return {
      icon: File,
      color: "from-gray-400 to-slate-500",
    };
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
                المكتبة 📚
              </h1>
              <p className="text-sm text-gray-500">
                {gradeNames[user.grade]} — ملفات ومذكرات للتحميل
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-[#1F4A3F]">
              {files.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">إجمالي الملفات</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-[#C9A227]">
              {new Set(files.map((f) => f.subject)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">عدد المواد</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {files.reduce((sum, f) => sum + f.download_count, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">إجمالي التحميلات</p>
          </div>
        </div>

        {/* Search & Filter */}
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSubject === s
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              {searchQuery || selectedSubject !== "الكل"
                ? "مفيش نتائج مطابقة"
                : "لسه مفيش ملفات"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedSubject !== "الكل"
                ? "جرب بحث تاني أو غيّر الفلتر"
                : "لما الإدارة ترفع ملفات، هتظهر هنا"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((f, i) => {
              const fileIcon = getFileIcon(f.file_type);
              const FileIcon = fileIcon.icon;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all"
                >
                  {/* Icon + Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fileIcon.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <FileIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-[#1F4A3F] mb-1 line-clamp-2">
                        {f.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                          {f.subject}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {f.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {f.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatSize(f.file_size)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {f.download_count}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(f)}
                      className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-sm font-medium hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                      تحميل
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}