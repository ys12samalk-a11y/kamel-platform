"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Loader2,
  Info,
  AlertTriangle,
  AlertCircle,
  Trophy,
  FileText,
  Megaphone,
  Star,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

const typeConfig: Record<
  string,
  { icon: any; color: string; bg: string }
> = {
  info: {
    icon: Info,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  urgent: {
    icon: AlertCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  announcement: {
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  assessment: {
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  competition: {
    icon: Trophy,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  talent: {
    icon: Star,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // جلب بيانات المستخدم
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // تحميل الإشعارات
  const loadNotifications = async () => {
    if (!user || !user.code) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?user=${user.code}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Notification error:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // نحدّث كل 30 ثانية
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // اقفل عند الضغط برة
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // تعليم إشعار واحد كمقروء
  const markAsRead = async (id: string) => {
    if (!user || !user.code) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_code: user.code, notification_id: id }),
      });
      if (res.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // تعليم كل الإشعارات كمقروءة
  const markAllAsRead = async () => {
    if (!user || !user.code) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_code: user.code, mark_all: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  if (!user) return null;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-[200]"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-white text-sm">
                  الإشعارات
                  {unreadCount > 0 && (
                    <span className="mr-2 text-xs text-[#C9A227]">
                      ({unreadCount} جديد)
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="px-4 py-2 border-b border-gray-100 flex justify-end">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-[#1F4A3F] hover:text-[#C9A227] font-medium transition"
                >
                  <CheckCheck className="w-3 h-3" />
                  تعليم الكل كمقروء
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading && safeNotifications.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#1F4A3F] animate-spin" />
                </div>
              ) : safeNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    مفيش إشعارات جديدة
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {safeNotifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.info;
                    const Icon = config.icon;
                    const content = (
                      <div
                        className={`p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3 ${
                          !n.is_read ? "bg-sky-50/30" : ""
                        }`}
                        onClick={() => {
                          if (!n.is_read) markAsRead(n.id);
                          if (n.link) {
                            window.location.href = n.link;
                          }
                        }}
                      >
                        <div
                          className={`w-10 h-10 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={`text-sm font-bold truncate ${
                                !n.is_read
                                  ? "text-[#1F4A3F]"
                                  : "text-gray-600"
                              }`}
                            >
                              {n.title}
                            </h4>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatDate(n.created_at)}
                          </p>
                        </div>
                      </div>
                    );

                    return n.link ? (
                      <Link key={n.id} href={n.link}>
                        {content}
                      </Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}