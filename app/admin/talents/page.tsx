"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  ArrowRight,
  Loader2,
  Heart,
  Trash2,
  Filter,
  Search,
  Crown,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Code,
  Palette,
  Music,
  BookOpen,
  Camera,
  Video,
  PenTool,
} from "lucide-react";

type Talent = {
  id: string;
  student_code: string;
  student_name: string | null;
  grade: string | null;
  class: string | null;
  title: string;
  description: string | null;
  category: string;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
};

const categories = [
  { value: "all", label: "الكل", icon: Sparkles, color: "from-gray-400 to-slate-500" },
  { value: "programming", label: "برمجة", icon: Code, color: "from-emerald-400 to-teal-500" },
  { value: "design", label: "تصميم", icon: Palette, color: "from-rose-400 to-pink-500" },
  { value: "art", label: "رسم", icon: PenTool, color: "from-purple-400 to-indigo-500" },
  { value: "music", label: "موسيقى", icon: Music, color: "from-amber-400 to-orange-500" },
  { value: "writing", label: "كتابة", icon: BookOpen, color: "from-sky-400 to-blue-500" },
  { value: "photography", label: "تصوير", icon: Camera, color: "from-cyan-400 to-teal-500" },
  { value: "video", label: "فيديو", icon: Video, color: "from-fuchsia-400 to-pink-500" },
];

const grades = [
  { value: "all", label: "كل الصفوف" },
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

export default function AdminTalentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filtered, setFiltered] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

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

  const loadTalents = async () => {
    try {
      const res = await fetch("/api/talents");
      const data = await res.json();
      if (data.success) {
        setTalents(data.talents);
        setFiltered(data.talents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTalents();
  }, [user]);

  // فلترة
  useEffect(() => {
    let result = talents;

    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (selectedGrade !== "all") {
      result = result.filter((t) => t.grade === selectedGrade);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.student_name && t.student_name.toLowerCase().includes(q)) ||
          t.student_code.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [selectedCategory, selectedGrade, searchQuery, talents]);

  // تعيين "موهبة الأسبوع"
  const handleFeature = async (id: string, currentFeatured: boolean) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/talents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_featured: !currentFeatured }),
      });

      if (res.ok) {
        // نحدّث القائمة كلها
        setTalents(
          talents.map((t) => ({
            ...t,
            is_featured: t.id === id ? !currentFeatured : false,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  // حذف موهبة
  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تمسح الموهبة دي؟")) return;

    setUpdating(id);
    try {
      const res = await fetch(`/api/talents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTalents(talents.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const getCategory = (val: string) =>
    categories.find((c) => c.value === val) || categories[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // إحصائيات
  const stats = {
    total: talents.length,
    featured: talents.filter((t) => t.is_featured).length,
    totalLikes: talents.reduce((sum, t) => sum + t.likes_count, 0),
    categories: new Set(talents.map((t) => t.category)).size,
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة المواهب 🌟
              </h1>
              <p className="text-sm text-gray-500">
                شوف مواهب الطلاب واختار موهبة الأسبوع
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
                <Star className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.total}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي المواهب</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.featured}
              </p>
            </div>
            <p className="text-xs text-gray-500">موهبة الأسبوع</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.totalLikes}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي اللايكات</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.categories}
              </p>
            </div>
            <p className="text-xs text-gray-500">عدد التصنيفات</p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم الطالب أو الكود..."
              className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedCategory(c.value)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === c.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {grades.map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGrade(g.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGrade === g.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Talents List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              {searchQuery || selectedCategory !== "all" || selectedGrade !== "all"
                ? "مفيش نتائج مطابقة"
                : "لسه مفيش مواهب"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedCategory !== "all" || selectedGrade !== "all"
                ? "جرب تغيير الفلتر"
                : "لما الطلاب يعرضوا مواهبهم، هتظهر هنا"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const c = getCategory(t.category);
              const CategoryIcon = c.icon;
              const isFeatured = t.is_featured;
              const isUpdating = updating === t.id;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group relative p-5 rounded-3xl bg-white/80 backdrop-blur border shadow-sm hover:shadow-xl transition-all ${
                    isFeatured
                      ? "border-[#C9A227] ring-2 ring-[#C9A227]/30"
                      : "border-white/60 hover:border-[#C9A227]/40"
                  }`}
                >
                  {/* Featured Badge */}
                  {isFeatured && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      موهبة الأسبوع
                    </div>
                  )}

                  {/* Category + Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}
                    >
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleFeature(t.id, t.is_featured)}
                        disabled={isUpdating}
                        title={isFeatured ? "إزالة التمييز" : "تعيين موهبة الأسبوع"}
                        className={`p-2 rounded-lg transition ${
                          isFeatured
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                        } disabled:opacity-50`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={isUpdating}
                        title="حذف"
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title + Description */}
                  <h3 className="font-bold text-lg text-[#1F4A3F] mb-2 line-clamp-2">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {t.description}
                    </p>
                  )}

                  {/* Media Link */}
                  {t.media_url && (
                    <a
                      href={t.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#C9A227] hover:text-[#1F4A3F] font-medium mb-3 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      عرض العمل
                    </a>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                    <span className="font-medium text-[#1F4A3F]">
                      {t.student_name || "طالب"}
                    </span>
                    {t.grade && t.class && (
                      <>
                        <span>•</span>
                        <span>
                          صف {t.grade} — فصل {t.class}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(t.created_at)}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium">
                      <Heart className="w-4 h-4" />
                      {t.likes_count}
                    </div>
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