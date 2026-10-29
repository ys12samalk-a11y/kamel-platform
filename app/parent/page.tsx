"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NotificationBell from "@/components/NotificationBell";
import {
  Users,
  FileText,
  CheckCircle2,
  Megaphone,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Settings,
  Calendar,
} from "lucide-react";

type UserData = {
  id: string;
  code: string;
  role: string;
  full_name: string;
};

type Child = {
  id: string;
  code: string;
  full_name: string | null;
  grade: string | null;
  class: string | null;
  relation: string;
};

const menuItems = [
  {
    icon: FileText,
    label: "درجات الأبناء",
    href: "/parent/grades",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: CheckCircle2,
    label: "غياب الأبناء",
    href: "/parent/attendance",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Settings,
    label: "الإعدادات",
    href: "/parent/settings",
    color: "from-gray-400 to-slate-500",
  },
];

const quickCards = [
  {
    icon: FileText,
    title: "الدرجات",
    desc: "شوف درجات أبنائك",
    color: "from-indigo-400 to-purple-500",
    href: "/parent/grades",
  },
  {
    icon: CheckCircle2,
    title: "الغياب",
    desc: "تابع غياب أبنائك",
    color: "from-emerald-400 to-teal-500",
    href: "/parent/attendance",
  },
  {
    icon: Megaphone,
    title: "الإعلانات",
    desc: "إعلانات فصول أبنائك",
    color: "from-rose-400 to-pink-500",
    href: "/parent#announcements",
  },
  {
    icon: Settings,
    title: "الإعدادات",
    desc: "بياناتك وحسابك",
    color: "from-gray-400 to-slate-500",
    href: "/parent/settings",
  },
];

export default function ParentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "parent") {
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
    const loadChildren = async () => {
      try {
        const res = await fetch(`/api/parent/students?parent=${user.code}`);
        const data = await res.json();
        if (data.success) {
          setChildren(data.students || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
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
              <p className="text-[11px] text-gray-500">لوحة ولي الأمر</p>
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
                أهلاً، {user.full_name || "ولي أمر"} 👋
              </h2>
              <p className="text-xs text-gray-500">
                لوحة ولي الأمر — منصة الحويج
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <a
                href="/parent/settings"
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
                👨‍👩‍👧 لوحة ولي الأمر
              </span>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                تابع أبنائك في مكان واحد
              </h3>
              <p className="text-white/70 max-w-xl">
                شوف الدرجات، تابع الغياب، واستقبل الإشعارات من المدرسين —
                كل حاجة عن أبنائك هنا.
              </p>
            </div>
          </motion.div>

          {/* Children */}
          <h3 className="font-bold text-xl text-[#1F4A3F] mb-4">
            👨‍🎓 أبنائي ({children.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#1F4A3F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : children.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                مفيش أبناء مربوطين
              </h3>
              <p className="text-gray-500 text-sm">
                تواصل مع الإدارة عشان يربطوا حسابك بأبنائك
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {children.map((child, i) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/40 shadow-sm hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {child.full_name?.charAt(0) || (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1F4A3F] text-lg truncate">
                        {child.full_name || "لم يكمل بياناته"}
                      </h4>
                      <p className="font-mono text-xs text-gray-500">
                        {child.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {child.grade && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <GraduationCap className="w-3 h-3" />
                        {child.grade === "1" && "أولى ثانوي"}
                        {child.grade === "2" && "تانية ثانوي"}
                        {child.grade === "3" && "تالتة ثانوي"}
                      </span>
                    )}
                    {child.class && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
                        <Users className="w-3 h-3" />
                        فصل {child.class}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <a
                      href={`/parent/grades?student=${child.code}`}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition-all text-center"
                    >
                      الدرجات
                    </a>
                    <a
                      href={`/parent/attendance?student=${child.code}`}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg transition-all text-center"
                    >
                      الغياب
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Cards */}
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
                className="group p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/30 shadow-sm hover:shadow-2xl transition-all"
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
              استخدم القائمة على اليمين للتنقل بين درجات أبنائك وغيابهم. لو
              حابب تربط ابنك بحسابك، تواصل مع الإدارة.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}