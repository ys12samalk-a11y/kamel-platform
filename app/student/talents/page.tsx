"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  ArrowRight,
  Loader2,
  Heart,
  Plus,
  X,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Filter,
  ExternalLink,
  Award,
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

export default function StudentTalentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filtered, setFiltered] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

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

  // تحميل المواهب
  const loadTalents = async () => {
    try {
      const res = await fetch("/api/talents");
      const data = await res.json();
      if (data.success) {
        setTalents(data.talents);
        setFiltered(data.talents);

        // نجيب لايكات الطالب
        if (user) {
          const likesRes = await Promise.all(
            data.talents.map((t: Talent) =>
              fetch(
                `/api/talents/like?talent=${t.id}&student=${user.code}`
              ).then((r) => r.json())
            )
          );
          const likedSet = new Set<string>();
          data.talents.forEach((t: Talent, i: number) => {
            if (likesRes[i].liked) likedSet.add(t.id);
          });
          setMyLikes(likedSet);
        }
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
    if (selectedCategory === "all") {
      setFiltered(talents);
    } else {
      setFiltered(talents.filter((t) => t.category === selectedCategory));
    }
  }, [selectedCategory, talents]);

  // رفع موهبة
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !category) {
      setError("الرجاء إدخال عنوان ونوع الموهبة");
      return;
    }

    setPosting(true);

    try {
      const res = await fetch("/api/talents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_code: user.code,
          student_name: user.full_name,
          grade: user.grade,
          class: user.class,
          title,
          description,
          category,
          media_url: mediaUrl,
          media_type: mediaUrl ? "link" : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setPosting(false);
        return;
      }

      setSuccess("تم رفع موهبتك بنجاح! 🎉");
      setTitle("");
      setDescription("");
      setCategory("");
      setMediaUrl("");
      loadTalents();

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

  // لايك
  const handleLike = async (talentId: string) => {
    if (!user) return;

    try {
      const res = await fetch("/api/talents/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talent_id: talentId,
          student_code: user.code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // نحدث القائمة
        setTalents(
          talents.map((t) =>
            t.id === talentId ? { ...t, likes_count: data.likes_count } : t
          )
        );
        // نحدث اللايكات
        const newLikes = new Set(myLikes);
        if (data.liked) {
          newLikes.add(talentId);
        } else {
          newLikes.delete(talentId);
        }
        setMyLikes(newLikes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // حذف موهبة
  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تمسح الموهبة دي؟")) return;

    try {
      const res = await fetch(`/api/talents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTalents(talents.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategory = (val: string) =>
    categories.find((c) => c.value === val) || categories[0];

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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                قسم المواهب 🌟
              </h1>
              <p className="text-sm text-gray-500">
                اعرض موهبتك وشوف مواهب زمايلك
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-bold hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              ارفع موهبتك
            </button>
            <button
              onClick={() => router.push("/student")}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
        </div>

        {/* Talents Grid */}
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
              {selectedCategory !== "all"
                ? "مفيش مواهب في التصنيف ده"
                : "لسه مفيش مواهب"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              كن أول واحد يعرض موهبته!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              ارفع موهبتك
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t, i) => {
              const c = getCategory(t.category);
              const CategoryIcon = c.icon;
              const isLiked = myLikes.has(t.id);
              const isMine = t.student_code === user.code;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl transition-all"
                >
                  {/* Category + Delete */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}
                    >
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    {isMine && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                    <button
                      onClick={() => handleLike(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        isLiked
                          ? "bg-rose-500 text-white shadow-md"
                          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-white" : ""
                        }`}
                      />
                      {t.likes_count}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - رفع موهبة */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1F4A3F]">
                    ارفع موهبتك
                  </h3>
                  <p className="text-xs text-gray-500">
                    خلي زمايلك يشوفوا إبداعك
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

            {/* Form */}
            <form onSubmit={handlePost} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  عنوان الموهبة
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: موقع ويب بالذكاء الاصطناعي"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  نوع الموهبة
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories
                    .filter((c) => c.value !== "all")
                    .map((c) => {
                      const Icon = c.icon;
                      const isSelected = category === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                            isSelected
                              ? `bg-gradient-to-br ${c.color} text-white shadow-md`
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {c.label}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  وصف <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح موهبتك بإيجاز..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Media URL */}
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  رابط العمل{" "}
                  <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  💡 حط لينك لموهبتك (GitHub, YouTube, Behance, إلخ)
                </p>
              </div>

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
                disabled={posting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    رفع الموهبة
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}