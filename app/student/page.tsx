"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NotificationBell from "@/components/NotificationBell";
import {
  Calendar,
  Trophy,
  Star,
  MessageSquare,
  BookOpen,
  Bot,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  Users,
  FileText,
  Megaphone,
  Settings,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
  grade: string;
  class: string;
  profile_completed: boolean;
};

const menuItems = [
  {
    icon: FileText,
    label: "التقييمات",
    href: "/student/assessments",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Megaphone,
    label: "الإعلانات",
    href: "/student/announcements",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: BookOpen,
    label: "المكتبة",
    href: "/student/library",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: Trophy,
    label: "المسابقات",
    href: "/student/competitions",
    color: "from-yellow-400 to-amber-500",
  },
  {
    icon: Star,
    label: "موهبتي",
    href: "/student/talents",
    color: "from-purple-400 to-indigo-500",
  },
  {
    icon: Calendar,
    label: "جدول الحصص",
    href: "/student/schedule",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Users,
    label: "دليل المدرسين",
    href: "/student/teachers",
    color: "from-cyan-400 to-sky-500",
  },
  {
    icon: MessageSquare,
    label: "شكاوى واقتراحات",
    href: "/student/complaints",
    color: "from-cyan-400 to-teal-500",
  },
  {
    icon: User,
    label: "الملف الشخصي",
    href: "/student/profile",
    color: "from-amber-400 to-orange-500",
  },
];

const quickCards = [
  {
    icon: FileText,
    title: "التقييمات",
    desc: "حمّل تقييماتك الأسبوعية",
    color: "from-indigo-400 to-purple-500",
    href: "/student/assessments",
  },
  {
    icon: Megaphone,
    title: "الإعلانات",
    desc: "شوف إعلانات فصلك",
    color: "from-rose-400 to-pink-500",
    href: "/student/announcements",
  },
  {
    icon: BookOpen,
    title: "المكتبة",
    desc: "ملفات ومذكرات للتحميل",
    color: "from-sky-400 to-blue-500",
    href: "/student/library",
  },
  {
    icon: Trophy,
    title: "المسابقات",
    desc: "شارك واكسب جوائز",
    color: "from-yellow-400 to-amber-500",
    href: "/student/competitions",
  },
];

export default function StudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

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
        const res = await fetch(
          `/api/announcements?grade=${user.grade}&class=${user.class}`
        );
        const data = await res.json();
        if (data.success) {
          setLatestAnnouncements(data.announcements.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    load();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);

    if (diff < 1) return "الآن";
    if (diff < 60) return `قبل ${diff} دقيقة`;
    if (diff < 1440) return `قبل ${Math.floor(diff / 60)} ساعة`;
    return `قبل ${Math.floor(diff / 1440)} يوم`;
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
              <p className="text-[11px] text-gray-500">لوحة الطالب</p>
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
                أهلاً، {user.full_name || "طالب"} 👋
              </h2>
              <p className="text-xs text-gray-500">
                {user.grade === "1" && "الصف الأول الثانوي"}
                {user.grade === "2" && "الصف الثاني الثانوي"}
                {user.grade === "3" && "الصف الثالث الثانوي"}
                {" — "}
                فصل {user.class}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/student/profile"
                className="relative p-2 rounded-xl hover:bg-gray-100 transition"
                title="الملف الشخصي"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </a>
              <NotificationBell />
              <a
                href="/student/profile"
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition"
              >
                {user.full_name?.charAt(0) || <User className="w-5 h-5" />}
              </a>
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
                ✨ منصة الحويج
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                جاهز تبدأ يومك؟
              </h3>
              <p className="text-white/70 max-w-xl">
                كل حاجة محتاجها هنا — جدولك، موهبتك، مسابقاتك، تقييماتك،
                وإعلانات فصلك.
              </p>
            </div>
          </motion.div>

          {/* Quick Cards */}
          <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
            إيه اللي عايز تعمله؟
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {quickCards.map((c, i) => (
              <motion.a
                key={i}
                href={c.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
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

          {/* Latest Announcements */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1F4A3F] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-500" />
                آخر إعلانات فصلك
              </h3>
              <a
                href="/student/announcements"
                className="text-xs text-[#1F4A3F] hover:text-[#C9A227] font-medium transition"
              >
                عرض الكل →
              </a>
            </div>

            {loadingAnnouncements ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : latestAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                لسه مفيش إعلانات جديدة لفصلك
              </p>
            ) : (
              <div className="space-y-3">
                {latestAnnouncements.map((a) => {
                  const priorityColor =
                    a.priority === "urgent"
                      ? "border-rose-200 bg-rose-50"
                      : a.priority === "important"
                      ? "border-amber-200 bg-amber-50"
                      : "border-sky-200 bg-sky-50";
                  return (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border ${priorityColor}`}
                    >
                      <h4 className="font-bold text-[#1F4A3F] text-sm mb-1">
                        {a.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {a.body}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {a.teacher_name && <span>أ. {a.teacher_name}</span>}
                        <span>•</span>
                        <span>{formatDate(a.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}