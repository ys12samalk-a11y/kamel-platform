"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowRight,
  Loader2,
  Search,
  Plus,
  X,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileText,
  User,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { ALL_SUBJECTS } from "@/lib/subjects";

type Teacher = {
  id: string;
  code: string;
  full_name: string;
  subject: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function AdminTeachersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal - إضافة / تعديل
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // تحميل المدرسين
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers-directory");
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers || []);
        setFiltered(data.teachers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTeachers();
  }, [user]);

  // فلترة
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(teachers);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      teachers.filter(
        (t) =>
          t.full_name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.subject && t.subject.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, teachers]);

  // فتح modal إضافة
  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setCode("");
    setFullName("");
    setSubject("");
    setPhone("");
    setWhatsapp("");
    setFacebook("");
    setEmail("");
    setBio("");
    setAvatarUrl("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // فتح modal تعديل
  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setCode(teacher.code);
    setFullName(teacher.full_name);
    setSubject(teacher.subject || "");
    setPhone(teacher.phone || "");
    setWhatsapp(teacher.whatsapp || "");
    setFacebook(teacher.facebook || "");
    setEmail(teacher.email || "");
    setBio(teacher.bio || "");
    setAvatarUrl(teacher.avatar_url || "");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // رفع صورة
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/teachers-directory/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ في رفع الصورة");
        setUploading(false);
        return;
      }

      setAvatarUrl(data.url);
      setSuccess("تم رفع الصورة بنجاح! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  // حفظ (إضافة أو تعديل)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("الاسم مطلوب");
      return;
    }

    if (!editingTeacher && !code.trim()) {
      setError("الكود مطلوب");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        full_name: fullName.trim(),
        subject: subject || null,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        facebook: facebook.trim() || null,
        email: email.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      };

      const url = editingTeacher
        ? `/api/teachers-directory/${editingTeacher.id}`
        : "/api/teachers-directory";
      const method = editingTeacher ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setSuccess(
        editingTeacher ? "تم حفظ التعديلات! ✅" : "تم إضافة المدرس! ✅"
      );
      loadTeachers();
      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  // حذف
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/teachers-directory/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTeachers(teachers.filter((t) => t.id !== id));
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
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
                إدارة دليل المدرسين 👨‍🏫
              </h1>
              <p className="text-sm text-gray-500">
                أضف، عدل، أو احذف مدرسين من الدليل
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-bold hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              مدرس جديد
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              رجوع
            </button>
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
              placeholder="ابحث بالكود أو الاسم أو المادة..."
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

        {/* Teachers List */}
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
              {searchQuery ? "مفيش نتائج مطابقة" : "لسه مفيش مدرسين"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery
                ? "جرب تغيير البحث"
                : "ابدأ بإضافة أول مدرس للدليل"}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                إضافة مدرس
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((teacher, i) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                    {teacher.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      teacher.full_name?.charAt(0) || <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1F4A3F] truncate">
                      {teacher.full_name}
                    </h3>
                    <p className="font-mono text-xs text-gray-500">
                      {teacher.code}
                    </p>
                    {teacher.subject && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <BookOpen className="w-3 h-3" />
                        {teacher.subject}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 transition"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id, teacher.full_name)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {teacher.phone && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{teacher.phone}</span>
                    </span>
                  )}
                  {teacher.whatsapp && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs">
                      <MessageCircle className="w-3 h-3" />
                      واتساب
                    </span>
                  )}
                  {teacher.email && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs">
                      <Mail className="w-3 h-3" />
                      إيميل
                    </span>
                  )}
                  {teacher.facebook && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                      <Globe className="w-3 h-3" />
                      فيسبوك
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - إضافة/تعديل */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]">
                <h3 className="font-bold text-xl text-white">
                  {editingTeacher ? "تعديل المدرس" : "إضافة مدرس جديد"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSave}
                className="p-6 max-h-[70vh] overflow-y-auto space-y-4"
              >
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      fullName?.charAt(0) || <User className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-[#1F4A3F] hover:bg-gray-50 transition cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          رفع صورة
                        </>
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="hidden"
                      disabled={uploading}
                    />
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl("")}
                        className="mr-2 text-xs text-rose-500 hover:underline"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      كود المدرس
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="HWG-TCH-0001"
                      dir="ltr"
                      required={!editingTeacher}
                      disabled={!!editingTeacher}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left font-mono disabled:bg-gray-50 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="اسم المدرس"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      المادة
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none cursor-pointer"
                    >
                      <option value="">بدون مادة</option>
                      {ALL_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      رقم الموبايل
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      رقم واتساب
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      الإيميل
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      رابط فيسبوك
                    </label>
                    <input
                      type="url"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none text-left"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#1F4A3F] mb-2">
                      نبذة
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="نبذة مختصرة عن المدرس..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 outline-none resize-none"
                    />
                  </div>
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

                {/* Save */}
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {editingTeacher ? "حفظ التعديلات" : "إضافة المدرس"}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}