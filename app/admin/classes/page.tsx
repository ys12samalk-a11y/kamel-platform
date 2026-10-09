"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Loader2,
  GraduationCap,
  Search,
  UserPlus,
  Trash2,
  X,
  ChevronLeft,
} from "lucide-react";

type Stats = Record<string, Record<string, number>>;

type Student = {
  id: string;
  code: string;
  role: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
  phone: string | null;
  status: string;
  profile_completed: boolean;
};

const grades = [
  { value: "1", label: "أولى ثانوي", color: "from-emerald-400 to-teal-500" },
  { value: "2", label: "تانية ثانوي", color: "from-amber-400 to-orange-500" },
  { value: "3", label: "تالتة ثانوي", color: "from-rose-400 to-pink-500" },
];

export default function AdminClassesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ "1": {}, "2": {}, "3": {} });
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal - إضافة طالب
  const [showAddModal, setShowAddModal] = useState(false);
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [unassignedLoading, setUnassignedLoading] = useState(false);
  const [unassignedSearch, setUnassignedSearch] = useState("");

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

  // تحميل الإحصائيات
  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/classes");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  // تحميل طلاب الفصل
  const loadStudents = async (grade: string, classNum: string) => {
    setStudentsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/classes?grade=${grade}&class=${classNum}`
      );
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOpenClass = (grade: string, classNum: string) => {
    setSelectedGrade(grade);
    setSelectedClass(classNum);
    loadStudents(grade, classNum);
  };

  const handleCloseClass = () => {
    setSelectedGrade(null);
    setSelectedClass(null);
    setStudents([]);
    loadStats();
  };

  // تحميل الطلاب غير الموزعين
  const loadUnassigned = async () => {
    setUnassignedLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        const free = data.users.filter(
          (u: Student) => u.role === "student" && (!u.grade || !u.class)
        );
        setUnassigned(free);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnassignedLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    loadUnassigned();
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedGrade || !selectedClass) return;

    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          grade: selectedGrade,
          class: selectedClass,
        }),
      });

      if (res.ok) {
        const added = unassigned.find((s) => s.id === studentId);
        if (added) {
          setStudents([
            ...students,
            {
              ...added,
              grade: selectedGrade,
              class: selectedClass,
            },
          ]);
          setUnassigned(unassigned.filter((s) => s.id !== studentId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("متأكد إنك عايز تشيل الطالب من الفصل؟")) return;

    try {
      const res = await fetch(`/api/admin/classes?id=${studentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents(students.filter((s) => s.id !== studentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // فلترة الطلاب
  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      (s.full_name && s.full_name.toLowerCase().includes(q))
    );
  });

  // فلترة غير الموزعين
  const filteredUnassigned = unassigned.filter((s) => {
    if (!unassignedSearch.trim()) return true;
    const q = unassignedSearch.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      (s.full_name && s.full_name.toLowerCase().includes(q))
    );
  });

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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة الفصول
              </h1>
              <p className="text-sm text-gray-500">
                وزّع الطلاب على الفصول
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

        {/* عرض الفصول */}
        {!selectedGrade ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
              </div>
            ) : (
              <div className="space-y-10">
                {grades.map((g) => (
                  <div key={g.value}>
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center shadow-lg`}
                      >
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="font-bold text-xl text-[#1F4A3F]">
                        {g.label}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Array.from({ length: 15 }, (_, i) => i + 1).map(
                        (classNum) => {
                          const count =
                            stats[g.value]?.[String(classNum)] || 0;
                          return (
                            <motion.button
                              key={classNum}
                              onClick={() =>
                                handleOpenClass(g.value, String(classNum))
                              }
                              whileHover={{ y: -4 }}
                              className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-xl transition-all text-right group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-[#1F4A3F]">
                                  فصل {classNum}
                                </span>
                                <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-[#C9A227] group-hover:-translate-x-1 transition-all" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {count} طالب
                                </span>
                              </div>
                            </motion.button>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* تفاصيل الفصل */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header الفصل */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white mb-6 shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="w-6 h-6 text-[#C9A227]" />
                    <h2 className="text-2xl font-bold">
                      {grades.find((g) => g.value === selectedGrade)?.label} —
                      فصل {selectedClass}
                    </h2>
                  </div>
                  <p className="text-white/70 text-sm">
                    {students.length} طالب مسجل في الفصل
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C9A227] text-[#1F4A3F] font-bold hover:bg-[#E0BC3E] transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    إضافة طالب
                  </button>
                  <button
                    onClick={handleCloseClass}
                    className="px-5 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
                  >
                    رجوع
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالكود أو الاسم..."
                  className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Students List */}
            {studentsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                  مفيش طلاب في الفصل
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  ابدأ بإضافة طلاب للفصل من الزر فوق
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition"
                >
                  <UserPlus className="w-4 h-4" />
                  إضافة طالب
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1F4A3F] text-sm truncate">
                          {s.full_name || (
                            <span className="text-gray-400 italic">
                              لم يكمل بياناته
                            </span>
                          )}
                        </p>
                        <p className="font-mono text-xs text-gray-500">
                          {s.code}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(s.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                        title="إزالة من الفصل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal - إضافة طالب */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-[#1F4A3F]">
                  إضافة طالب للفصل
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  اختر طالب من اللي مش موزعين
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={unassignedSearch}
                  onChange={(e) => setUnassignedSearch(e.target.value)}
                  placeholder="ابحث بكود أو اسم الطالب..."
                  className="w-full pr-12 pl-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {unassignedLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-[#1F4A3F] animate-spin" />
                </div>
              ) : filteredUnassigned.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    مفيش طلاب غير موزعين
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUnassigned.slice(0, 100).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1F4A3F] text-sm truncate">
                          {s.full_name || (
                            <span className="text-gray-400 italic">
                              لم يكمل بياناته
                            </span>
                          )}
                        </p>
                        <p className="font-mono text-xs text-gray-500">
                          {s.code}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddStudent(s.id)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-sm font-medium hover:shadow-lg transition"
                      >
                        <UserPlus className="w-3 h-3" />
                        إضافة
                      </button>
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