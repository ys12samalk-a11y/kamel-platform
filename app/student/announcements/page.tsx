"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Megaphone,
  ArrowRight,
  Loader2,
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Filter,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  teacher_name: string | null;
  grade: string | null;
  class: string | null;
  priority: string;
  created_at: string;
};

const priorities = [
  {
    value: "all",
    label: "الكل",
  },
  {
    value: "urgent",
    label: "عاجل",
    icon: AlertCircle,
    color: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  {
    value: "important",
    label: "مهم",
    icon: AlertTriangle,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  {
    value: "normal",
    label: "عادي",
    icon: Info,
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
];

export default function StudentAnnouncementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState("all");

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

  const loadAnnouncements = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/announcements?grade=${user.grade}&class=${user.class}`
      );
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
        setFiltered(data.announcements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAnnouncements();
  }, [user]);

  useEffect(() => {
    if (selectedPriority === "all") {
      setFiltered(announcements);
    } else {
      setFiltered(
        announcements.filter((a) => a.priority === selectedPriority)
      );
    }
  }, [selectedPriority, announcements]);

  const getPriority = (p: string) =>
    priorities.find((pr) => pr.value === p) || priorities[3];

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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Megaphone className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                الإعلانات
              </h1>
              <p className="text-sm text-gray-500">
                كل الإعلانات الخاصة بفصلك
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/student")}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 text-[#1F4A3F] font-medium hover:bg-white transition"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            رجوع
          </button>
        </div>

        {/* Filter */}
        <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedPriority(p.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedPriority === p.value
                    ? "bg-[#1F4A3F] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
              {selectedPriority !== "all"
                ? "مفيش إعلانات في التصنيف ده"
                : "مفيش إعلانات"}
            </h3>
            <p className="text-gray-500 text-sm">
              {selectedPriority !== "all"
                ? "جرب تصنيف تاني"
                : "لما المدرس ينشر إعلان، هيظهر هنا"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const p = getPriority(a.priority);
              const Icon = p.icon || Info;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1F4A3F] mb-2">
                        {a.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                        {a.body}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span
                          className={`px-2 py-1 rounded-lg ${p.bg} ${p.text} border ${p.border} font-medium`}
                        >
                          {p.label}
                        </span>
                        {a.teacher_name && (
                          <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                            أ. {a.teacher_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}