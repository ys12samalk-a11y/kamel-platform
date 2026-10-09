"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  ClipboardList,
  BookOpen,
  Megaphone,
  MessageSquare,
  Trophy,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  GraduationCap,
  TrendingUp,
  Star,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  profile_completed: boolean;
};

const menuItems = [
  {
    icon: Users,
    label: "إدارة المستخدمين",
    href: "/admin/users",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: FileText,
    label: "إدارة التقييمات",
    href: "/admin/assessments",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: ClipboardList,
    label: "قوائم الفصول",
    href: "/admin/classes",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: BookOpen,
    label: "المكتبة",
    href: "/admin/library",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: Megaphone,
    label: "الإعلانات",
    href: "/admin/announcements",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: MessageSquare,
    label: "الشكاوى والاقتراحات",
    href: "/admin/complaints",
    color: "from-cyan-400 to-teal-500",
  },
  {
    icon: Star,
    label: "المواهب",
    href: "/admin/talents",
    color: "from-fuchsia-400 to-pink-500",
  },
  {
    icon: Trophy,
    label: "المسابقات",
    href: "/admin/competitions",
    color: "from-yellow-400 to-amber-500",
  },
  {
    icon: Settings,
    label: "الإعدادات",
    href: "/admin/settings",
    color: "from-gray-400 to-slate-500",
  },
];

const quickCards = [
  {
    icon: Users,
    title: "إدارة المستخدمين",
    desc: "شوف وتحكم في كل الحسابات",
    color: "from-emerald-400 to-teal-500",
    href: "/admin/users",
  },
  {
    icon: FileText,
    title: "رفع تقييم",
    desc: "أضف تقييم جديد للطلاب",
    color: "from-indigo-400 to-purple-500",
    href: "/admin/assessments",
  },
  {
    icon: BookOpen,
    title: "المكتبة",
    desc: "ارفع ملفات ومذكرات",
    color: "from-sky-400 to-blue-500",
    href: "/admin/library",
  },
  {
    icon: Megaphone,
    title: "نشر إعلان",
    desc: "وصّل رسالة لكل المدرسة",
    color: "from-rose-400 to-pink-500",
    href: "/admin/announcements",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    assessments: 0,
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();

        const assessmentsRes = await fetch("/api/assessments");
        const assessmentsData = await assessmentsRes.json();

        if (usersData.success) {
          const usersList = usersData.users;
          setStats({
            totalUsers: usersList.length,
            students: usersList.filter((u: any) => u.role === "student").length,
            teachers: usersList.filter((u: any) => u.role === "teacher").length,
            assessments: assessmentsData.success
              ? assessmentsData.assessments.length
              : 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-white/80 backdrop-blur-xl border-l border-white/60 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-[#1F4A3F]">منصة الحويج</h1>
              <p className="text-[11px] text-gray-500">لوحة الإدارة</p>
            </div>
          </div>
        </div>

        <nav
          className="p-4 space-y-1.5 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          {menuItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#1F4A3F]/5 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-[#1F4A3F] text-sm">
                {item.label}
              </span>
            </motion.a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white/80 backdrop-blur">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 transition"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:mr-72">
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/60">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="font-bold text-lg text-[#1F4A3F]">
                أهلاً، {user.full_name || "مدير"} 👋
              </h2>
              <p className="text-xs text-gray-500">
                لوحة تحكم الإدارة — منصة الحويج
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold shadow-lg">
                {user.full_name?.charAt(0) || <User className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white mb-8 overflow-hidden shadow-2xl shadow-emerald-900/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
              <span className="inline-block px-4 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium mb-4">
                🏫 لوحة الإدارة
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                إدارة كاملة للمنصة
              </h3>
              <p className="text-white/70 max-w-xl">
                تحكم في كل حاجة — المستخدمين، التقييمات، الإعلانات،
                والمسابقات، وكمان شوف إحصائيات فورية عن المدرسة.
              </p>
            </div>
          </motion.div>

          <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
            📊 إحصائيات سريعة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">إجمالي المستخدمين</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.students}
              </p>
              <p className="text-xs text-gray-500 mt-1">عدد الطلاب</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.teachers}
              </p>
              <p className="text-xs text-gray-500 mt-1">عدد المدرسين</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.assessments}
              </p>
              <p className="text-xs text-gray-500 mt-1">التقييمات المرفوعة</p>
            </motion.div>
          </div>

          <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
            ⚡ إجراءات سريعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {quickCards.map((c, i) => (
              <motion.a
                key={i}
                href={c.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/30 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <c.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="font-bold text-[#1F4A3F] mb-1">{c.title}</h4>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </motion.a>
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60">
            <h3 className="font-bold text-lg text-[#1F4A3F] mb-3">
              💡 نصيحة
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              استخدم القائمة على اليمين للتنقل بين كل خدمات الإدارة.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}