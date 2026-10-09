"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  ClipboardList,
  Calendar,
  Megaphone,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  Bell,
  CheckCircle2,
  TrendingUp,
  BookOpen,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  subject?: string;
};

const menuItems = [
  {
    icon: ClipboardList,
    label: "سجل الدرجات",
    href: "/teacher/grades",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: CheckCircle2,
    label: "سجل الغياب",
    href: "/teacher/attendance",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Users,
    label: "قوائم الفصول",
    href: "/teacher/classes",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: Calendar,
    label: "جدول الحصص",
    href: "/teacher/schedule",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Megaphone,
    label: "إعلانات الفصل",
    href: "/teacher/announcements",
    color: "from-rose-400 to-pink-500",
  },
];

const quickCards = [
  {
    icon: ClipboardList,
    title: "سجل الدرجات",
    desc: "سجّل درجات طلابك",
    color: "from-amber-400 to-orange-500",
    href: "/teacher/grades",
  },
  {
    icon: CheckCircle2,
    title: "تسجيل الحضور",
    desc: "سجّل حضور اليوم",
    color: "from-emerald-400 to-teal-500",
    href: "/teacher/attendance",
  },
  {
    icon: Users,
    title: "قوائم الفصول",
    desc: "اعرض طلاب فصولك",
    color: "from-sky-400 to-blue-500",
    href: "/teacher/classes",
  },
  {
    icon: Megaphone,
    title: "إعلان جديد",
    desc: "انشر إعلان لفصلك",
    color: "from-rose-400 to-pink-500",
    href: "/teacher/announcements",
  },
];

export default function TeacherPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    gradesCount: 0,
    attendanceToday: 0,
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
      if (parsed.role !== "teacher") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // تحميل الإحصائيات
  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        // عدد الدرجات
        const gradesRes = await fetch(
          `/api/grades?teacher=${user.code}`
        );
        const gradesData = await gradesRes.json();

        // عدد الغياب النهاردة
        const today = new Date().toISOString().split("T")[0];
        const attRes = await fetch(`/api/attendance?date=${today}`);
        const attData = await attRes.json();

        setStats({
          totalStudents: 0,
          gradesCount: gradesData.success ? gradesData.grades.length : 0,
          attendanceToday: attData.success ? attData.attendance.length : 0,
        });
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
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      {/* Sidebar */}
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
              <p className="text-[11px] text-gray-500">لوحة المدرس</p>
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
              transition={{ delay: i * 0.05 }}
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

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:mr-72">
        {/* Topbar */}
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
                أهلاً، أ. {user.full_name || "مدرس"} 👋
              </h2>
              <p className="text-xs text-gray-500">
                {user.subject ? `مدرس ${user.subject}` : "لوحة المدرس"}
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

        {/* Content */}
        <div className="p-6">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white mb-8 overflow-hidden shadow-2xl shadow-emerald-900/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative">
              <span className="inline-block px-4 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium mb-4">
                👨‍🏫 لوحة المدرس
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                جاهز تبدأ يومك؟
              </h3>
              <p className="text-white/70 max-w-xl">
                سجّل درجات طلابك، سجّل الحضور والغياب، وشوف قوائم فصولك —
                كل حاجة في مكان واحد.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
            📊 إحصائيات سريعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.gradesCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">درجات مسجلة</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {loading ? "..." : stats.attendanceToday}
              </p>
              <p className="text-xs text-gray-500 mt-1">حضور النهاردة</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F4A3F]">
                {user.subject ? "—" : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">عدد فصولك</p>
            </motion.div>
          </div>

          {/* Quick Actions */}
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
                transition={{ delay: 0.25 + i * 0.08 }}
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

          {/* Info */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60">
            <h3 className="font-bold text-lg text-[#1F4A3F] mb-3">
              💡 نصيحة
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ابدأ بتسجيل حضور اليوم من "سجل الغياب"، وبعدها سجّل درجات
              الطلاب من "سجل الدرجات". كل حاجة بتتحفظ تلقائيًا.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}