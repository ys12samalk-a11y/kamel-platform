"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  X,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";

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

const subjects = [
  "الكل",
  "عربي",
  "إنجليزي",
  "رياضيات",
  "علوم",
  "دراسات",
  "دين",
  "حاسب آلي",
];

const gradeNames: Record<string, string> = {
  "1": "الصف الأول",
  "2": "الصف الثاني",
  "3": "الصف الثالث",
};

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filtered, setFiltered] = useState<Assessment[]>([]);
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

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await fetch("/api/assessments");
        const data = await res.json();
        if (data.success) {
          const myGrade = data.assessments.filter(
            (a: Assessment) => a.grade === user.grade
          );
          setAssessments(myGrade);
          setFiltered(myGrade);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    let result = assessments;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          (a.week && a.week.toLowerCase().includes(q))
      );
    }

    if (selectedSubject !== "الكل") {
      result = result.filter((a) => a.subject === selectedSubject);
    }

    setFiltered(result);
  }, [searchQuery, selectedSubject, assessments]);

  const handleDownload = async (assessment: Assessment) => {
    try {
      await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assessment.id }),
      });
    } catch (err) {
      console.error(err);
    }
    window.open(assessment.file_url, "_blank");
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">التقييمات</h1>
              <p className="text-sm text-gray-500">
                {gradeNames[user.grade]} — فصل {user.class}
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

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-[#1F4A3F]">
              {assessments.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">إجمالي التقييمات</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-[#C9A227]">
              {new Set(assessments.map((a) => a.subject)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">عدد المواد</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {assessments.reduce((sum, a) => sum + a.download_count, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">إجمالي التحميلات</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو الأسبوع..."
              className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
                : "لسه مفيش تقييمات"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedSubject !== "الكل"
                ? "جرب بحث تاني أو غيّر الفلتر"
                : "لما الإدارة ترفع تقييمات، هتظهر هنا"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                      a.file_type.includes("pdf")
                        ? "bg-gradient-to-br from-rose-400 to-pink-500"
                        : "bg-gradient-to-br from-sky-400 to-blue-500"
                    }`}
                  >
                    {a.file_type.includes("pdf") ? (
                      <FileText className="w-7 h-7 text-white" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#1F4A3F] mb-1 truncate">
                      {a.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                        {a.subject}
                      </span>
                      {a.week && (
                        <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-700">
                          {a.week}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {a.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {a.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatSize(a.file_size)}</span>
                    <span>•</span>
                    <span>{a.download_count} تحميل</span>
                  </div>
                  <button
                    onClick={() => handleDownload(a)}
                    className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                    تحميل
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}