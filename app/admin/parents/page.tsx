"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowRight,
  Loader2,
  Search,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Link2,
  User,
  GraduationCap,
} from "lucide-react";

type Parent = {
  id: string;
  code: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  children_count?: number;
};

type Student = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
};

export default function AdminParentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [filtered, setFiltered] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal - ربط طالب
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [relation, setRelation] = useState("parent");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  // تحميل بيانات المستخدم
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

  // تحميل أولياء الأمور
  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/link");
      const data = await res.json();
      if (data.success) {
        setParents(data.parents || []);
        setFiltered(data.parents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadParents();
  }, [user]);

  // فلترة
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(parents);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      parents.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          (p.full_name && p.full_name.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, parents]);

  // فتح modal ربط
  const handleOpenLink = async (parent: Parent) => {
    setSelectedParent(parent);
    setStudentCode("");
    setRelation("parent");
    setLinkError("");
    setLinkSuccess("");
    setParentChildren([]);
    setChildrenLoading(true);

    try {
      const res = await fetch(`/api/parent/link?parent=${parent.code}`);
      const data = await res.json();
      if (data.success) {
        setParentChildren(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChildrenLoading(false);
    }
  };

  // ربط طالب
  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent || !studentCode.trim()) return;

    setLinkError("");
    setLinkSuccess("");
    setLinking(true);

    try {
      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_code: selectedParent.code,
          student_code: studentCode.trim().toUpperCase(),
          relation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLinkError(data.error || "حدث خطأ");
        setLinking(false);
        return;
      }

      setLinkSuccess("تم الربط بنجاح! ✅");
      setStudentCode("");

      // نعيد تحميل الأبناء
      const res2 = await fetch(
        `/api/parent/link?parent=${selectedParent.code}`
      );
      const data2 = await res2.json();
      if (data2.success) {
        setParentChildren(data2.students || []);
      }

      setTimeout(() => setLinkSuccess(""), 3000);
    } catch (err) {
      setLinkError("حدث خطأ في الاتصال");
    } finally {
      setLinking(false);
    }
  };

  // فك الربط
  const handleUnlink = async (studentCodeToUnlink: string) => {
    if (!selectedParent) return;
    if (!confirm("متأكد إنك عايز تفك الربط؟")) return;

    try {
      const res = await fetch(
        `/api/parent/link?parent=${selectedParent.code}&student=${studentCodeToUnlink}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setParentChildren(
          parentChildren.filter((c) => c.code !== studentCodeToUnlink)
        );
        // نحدّث العدد في القائمة الرئيسية
        setParents(
          parents.map((p) =>
            p.code === selectedParent.code
              ? {
                  ...p,
                  children_count: Math.max((p.children_count || 1) - 1, 0),
                }
              : p
          )
        );
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                أولياء الأمور 👨‍👩‍👧
              </h1>
              <p className="text-sm text-gray-500">
                اربط كل ولي أمر بأبنائه
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {parents.length}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي أولياء الأمور</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {parents.filter((p) => (p.children_count || 0) > 0).length}
              </p>
            </div>
            <p className="text-xs text-gray-500">مربوطين بأبناء</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {parents.filter((p) => (p.children_count || 0) === 0).length}
              </p>
            </div>
            <p className="text-xs text-gray-500">مش مربوطين</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {parents.reduce(
                  (sum, p) => sum + (p.children_count || 0),
                  0
                )}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي الروابط</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالكود أو الاسم..."
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
        </div>

        {/* Parents List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              مفيش نتائج
            </h3>
            <p className="text-gray-500 text-sm">
              جرب تغيير البحث
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
              <div className="col-span-3">الكود</div>
              <div className="col-span-4">الاسم</div>
              <div className="col-span-2">عدد الأبناء</div>
              <div className="col-span-3 text-center">إجراءات</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.slice(0, 100).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition items-center"
                >
                  <div className="md:col-span-3">
                    <p className="font-mono text-xs font-bold text-[#1F4A3F]">
                      {p.code}
                    </p>
                  </div>

                  <div className="md:col-span-4">
                    <p className="font-medium text-[#1F4A3F] text-sm">
                      {p.full_name || (
                        <span className="text-gray-400 italic">
                          لم يكمل بياناته
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        (p.children_count || 0) > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {(p.children_count || 0) > 0
                        ? `${p.children_count} ابن`
                        : "غير مربوط"}
                    </span>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenLink(p)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-sm font-medium hover:shadow-lg transition"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      إدارة الربط
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filtered.length > 100 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
                بيتم عرض 100 من {filtered.length} — استخدم البحث للتصفية
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - ربط طالب */}
      <AnimatePresence>
        {selectedParent && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-[#C9A227]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">
                      إدارة الربط
                    </h3>
                    <p className="text-xs text-white/60 font-mono">
                      {selectedParent.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedParent(null)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                {/* Parent Info */}
                <div className="p-4 rounded-2xl bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">ولي الأمر</p>
                  <p className="font-bold text-[#1F4A3F]">
                    {selectedParent.full_name || "لم يكمل بياناته"}
                  </p>
                </div>

                {/* Children List */}
                <div>
                  <h4 className="font-bold text-[#1F4A3F] mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    الأبناء المربوطين ({parentChildren.length})
                  </h4>

                  {childrenLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
                    </div>
                  ) : parentChildren.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gray-50 text-center">
                      <p className="text-sm text-gray-500">
                        مفيش أبناء مربوطين
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {parentChildren.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {c.full_name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#1F4A3F] text-sm truncate">
                              {c.full_name || "لم يكمل بياناته"}
                            </p>
                            <p className="font-mono text-xs text-gray-500">
                              {c.code}
                              {c.grade && ` • صف ${c.grade}`}
                              {c.class && ` • فصل ${c.class}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnlink(c.code)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                            title="فك الربط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Link */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-[#1F4A3F]/30 bg-[#1F4A3F]/5">
                  <h4 className="font-bold text-[#1F4A3F] mb-3 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    ربط طالب جديد
                  </h4>

                  <form onSubmit={handleLink} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1F4A3F] mb-1.5">
                          كود الطالب
                        </label>
                        <input
                          type="text"
                          value={studentCode}
                          onChange={(e) => setStudentCode(e.target.value)}
                          placeholder="HWG-STU-0001"
                          dir="ltr"
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#1F4A3F] mb-1.5">
                          صلة القرابة
                        </label>
                        <select
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-sm cursor-pointer"
                        >
                          <option value="parent">ولي أمر</option>
                          <option value="father">أب</option>
                          <option value="mother">أم</option>
                          <option value="guardian">وصي</option>
                        </select>
                      </div>
                    </div>

                    {linkError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{linkError}</span>
                      </div>
                    )}

                    {linkSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{linkSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={linking || !studentCode.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                    >
                      {linking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الربط...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          ربط الطالب
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}