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
  X,
  CheckCircle2,
  XCircle,
  Trash2,
  GraduationCap,
  BookOpen,
  UserCheck,
  UserX,
  Settings,
  Save,
  AlertCircle,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
  subject: string | null;
  phone: string | null;
  grades: string[] | null;
  classes: string[] | null;
  profile_completed: boolean;
  status: string;
  last_login: string | null;
  created_at: string;
};

const roles = [
  { value: "all", label: "الكل" },
  { value: "student", label: "طلاب" },
  { value: "teacher", label: "مدرسين" },
  { value: "admin", label: "إدارة" },
];

const gradesFilter = [
  { value: "all", label: "كل الصفوف" },
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const allGrades = [
  { value: "1", label: "أولى ثانوي" },
  { value: "2", label: "تانية ثانوي" },
  { value: "3", label: "تالتة ثانوي" },
];

const allClasses = Array.from({ length: 15 }, (_, i) => String(i + 1));

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

  // Modal - تعديل صلاحيات مدرس
  const [editingTeacher, setEditingTeacher] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    subject: "",
    phone: "",
    grades: [] as string[],
    classes: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

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

  // تحميل المستخدمين — ⚠️ اتصلّح: useRef لمنع التكرار
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    let isCancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!isCancelled && data.success) {
          setUsers(data.users);
          setFiltered(data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.code]);

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

  // فتح Modal
  const openEditModal = (teacher: UserData) => {
    setEditingTeacher(teacher);
    setEditForm({
      full_name: teacher.full_name || "",
      subject: teacher.subject || "",
      phone: teacher.phone || "",
      grades: teacher.grades || [],
      classes: teacher.classes || [],
    });
    setModalError("");
    setModalSuccess("");
  };

  // تبديل صف
  const toggleGrade = (g: string) => {
    setEditForm({
      ...editForm,
      grades: editForm.grades.includes(g)
        ? editForm.grades.filter((x) => x !== g)
        : [...editForm.grades, g],
    });
  };

  // تبديل فصل
  const toggleClass = (c: string) => {
    setEditForm({
      ...editForm,
      classes: editForm.classes.includes(c)
        ? editForm.classes.filter((x) => x !== c)
        : [...editForm.classes, c],
    });
  };

  // حفظ تعديلات المدرس
  const handleSaveTeacher = async () => {
    if (!editingTeacher) return;
    setModalError("");
    setModalSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/update-teacher", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editingTeacher.code,
          full_name: editForm.full_name.trim(),
          subject: editForm.subject.trim(),
          phone: editForm.phone.trim() || null,
          grades: editForm.grades,
          classes: editForm.classes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setModalSuccess("تم حفظ التعديلات بنجاح! ✅");

      setUsers(
        users.map((u) =>
          u.code === editingTeacher.code
            ? {
                ...u,
                full_name: editForm.full_name.trim(),
                subject: editForm.subject.trim(),
                phone: editForm.phone.trim() || null,
                grades: editForm.grades,
                classes: editForm.classes,
              }
            : u
        )
      );

      setTimeout(() => {
        setModalSuccess("");
        setEditingTeacher(null);
      }, 1500);
    } catch (err) {
      setModalError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

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

          {selectedRole === "student" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {gradesFilter.map((g) => (
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
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
              <div className="col-span-2">الكود</div>
              <div className="col-span-3">الاسم</div>
              <div className="col-span-2">النوع</div>
              <div className="col-span-2">الصف/الفصل</div>
              <div className="col-span-2">الحالة</div>
              <div className="col-span-1 text-center">إجراءات</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filtered.slice(0, 100).map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition items-center"
                >
                  <div className="md:col-span-2">
                    <p className="font-mono text-xs font-bold text-[#1F4A3F]">
                      {u.code}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="font-medium text-[#1F4A3F] text-sm">
                      {u.full_name || (
                        <span className="text-gray-400 italic">
                          لم يكمل بياناته
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        roleBadge[u.role]?.color || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleBadge[u.role]?.label || u.role}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    {u.grade ? (
                      <p className="text-xs text-gray-600">
                        صف {u.grade} — فصل {u.class || "—"}
                      </p>
                    ) : u.subject ? (
                      <p className="text-xs text-gray-600">
                        {u.subject}
                        {u.grades && u.grades.length > 0 && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {u.grades.length} صف • {u.classes?.length || 0} فصل
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">—</p>
                    )}
                  </div>

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

                  <div className="md:col-span-1 flex items-center justify-center gap-1">
                    {u.role === "teacher" && (
                      <button
                        onClick={() => openEditModal(u)}
                        title="تعديل صلاحيات"
                        className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
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

            {filtered.length > 100 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
                بيتم عرض 100 من {filtered.length} — استخدم البحث للتصفية
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - تعديل صلاحيات مدرس */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">
                    تعديل صلاحيات المدرس
                  </h3>
                  <p className="text-xs text-white/60 font-mono">
                    {editingTeacher.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  رقم الموبايل
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none transition-all text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                  المادة اللي بيدرّسها
                </label>
                <select
                  value={editForm.subject}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
                >
                  <option value="">اختر المادة</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-3">
                  الصفوف اللي بيدرّسها
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {allGrades.map((g) => {
                    const isSelected = editForm.grades.includes(g.value);
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => toggleGrade(g.value)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "border-[#1F4A3F] bg-[#1F4A3F]/5"
                            : "border-gray-200 hover:border-[#C9A227]/40 bg-white"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                            isSelected
                              ? "bg-[#1F4A3F] border-[#1F4A3F]"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-[#1F4A3F]" : "text-gray-600"
                          }`}
                        >
                          {g.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F4A3F] mb-3">
                  الفصول اللي بيدرّسها
                </label>
                <div className="flex gap-2 flex-wrap">
                  {allClasses.map((c) => {
                    const isSelected = editForm.classes.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleClass(c)}
                        className={`w-12 h-12 rounded-2xl border-2 font-bold transition-all ${
                          isSelected
                            ? "border-[#C9A227] bg-[#C9A227] text-white shadow-md"
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#C9A227]/40"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, classes: allClasses })
                    }
                    className="text-xs text-[#1F4A3F] hover:text-[#C9A227] font-medium"
                  >
                    اختار الكل
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, classes: [] })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    إلغاء الكل
                  </button>
                </div>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={handleSaveTeacher}
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التعديلات
                  </>
                )}
              </button>
              <button
                onClick={() => setEditingTeacher(null)}
                className="px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}