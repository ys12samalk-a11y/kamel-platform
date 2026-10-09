"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
  User,
  CheckCircle2,
  XCircle,
  Trash2,
  GraduationCap,
  BookOpen,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
  phone: string | null;
  profile_completed: boolean;
  status: string;
  last_login: string | null;
  created_at: string;
};

const roles = [
  { value: "all", label: "الكل", color: "bg-gray-100 text-gray-700" },
  { value: "student", label: "طلاب", color: "bg-emerald-100 text-emerald-700" },
  { value: "teacher", label: "مدرسين", color: "bg-sky-100 text-sky-700" },
  { value: "admin", label: "إدارة", color: "bg-purple-100 text-purple-700" },
];

const grades = [
  { value: "all", label: "كل الصفوف" },
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const roleBadge: Record<string, { label: string; color: string }> = {
  student: { label: "طالب", color: "bg-emerald-100 text-emerald-700" },
  teacher: { label: "مدرس", color: "bg-sky-100 text-sky-700" },
  admin: { label: "إدارة", color: "bg-purple-100 text-purple-700" },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filtered, setFiltered] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

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

  // تحميل المستخدمين
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setFiltered(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadUsers();
  }, [user]);

  // فلترة
  useEffect(() => {
    let result = users;

    if (selectedRole !== "all") {
      result = result.filter((u) => u.role === selectedRole);
    }

    if (selectedGrade !== "all") {
      result = result.filter((u) => u.grade === selectedGrade);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.code.toLowerCase().includes(q) ||
          (u.full_name && u.full_name.toLowerCase().includes(q))
      );
    }

    setFiltered(result);
  }, [searchQuery, selectedRole, selectedGrade, users]);

  const handleToggleStatus = async (u: UserData) => {
    setUpdating(u.id);
    const newStatus = u.status === "active" ? "suspended" : "active";

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          updates: { status: newStatus },
        }),
      });

      if (res.ok) {
        setUsers(
          users.map((item) =>
            item.id === u.id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (u: UserData) => {
    if (!confirm(`متأكد إنك عايز تمسح ${u.full_name || u.code}؟`)) return;

    setUpdating(u.id);
    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter((item) => item.id !== u.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  // إحصائيات
  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    active: users.filter((u) => u.status === "active").length,
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                إدارة المستخدمين
              </h1>
              <p className="text-sm text-gray-500">
                تحكم كامل في كل الحسابات
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
                {stats.total}
              </p>
            </div>
            <p className="text-xs text-gray-500">إجمالي الحسابات</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.students}
              </p>
            </div>
            <p className="text-xs text-gray-500">طلاب</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.teachers}
              </p>
            </div>
            <p className="text-xs text-gray-500">مدرسين</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1F4A3F]">
                {stats.active}
              </p>
            </div>
            <p className="text-xs text-gray-500">حسابات نشطة</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          {/* Search */}
          <div className="relative mb-4">
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

          {/* Role Filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedRole === r.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Grade Filter (only when students) */}
          {selectedRole === "student" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
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
          )}
        </div>

        {/* Users Table */}
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
              جرب تغيير الفلتر أو البحث
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
              <div className="col-span-2">الكود</div>
              <div className="col-span-3">الاسم</div>
              <div className="col-span-2">النوع</div>
              <div className="col-span-2">الصف/الفصل</div>
              <div className="col-span-2">الحالة</div>
              <div className="col-span-1 text-center">إجراءات</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {filtered.slice(0, 100).map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition items-center"
                >
                  {/* Code */}
                  <div className="md:col-span-2">
                    <p className="font-mono text-xs font-bold text-[#1F4A3F]">
                      {u.code}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="md:col-span-3">
                    <p className="font-medium text-[#1F4A3F] text-sm">
                      {u.full_name || (
                        <span className="text-gray-400 italic">لم يكمل بياناته</span>
                      )}
                    </p>
                  </div>

                  {/* Role */}
                  <div className="md:col-span-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        roleBadge[u.role]?.color || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleBadge[u.role]?.label || u.role}
                    </span>
                  </div>

                  {/* Grade/Class */}
                  <div className="md:col-span-2">
                    {u.grade ? (
                      <p className="text-xs text-gray-600">
                        صف {u.grade} — فصل {u.class || "—"}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">—</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    {u.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
                        <XCircle className="w-3 h-3" />
                        موقوف
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={updating === u.id}
                      title={u.status === "active" ? "إيقاف" : "تفعيل"}
                      className={`p-2 rounded-lg transition ${
                        u.status === "active"
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      } disabled:opacity-50`}
                    >
                      {updating === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.status === "active" ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={updating === u.id}
                      title="حذف"
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Info */}
            {filtered.length > 100 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
                بيتم عرض 100 من {filtered.length} — استخدم البحث للتصفية
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}