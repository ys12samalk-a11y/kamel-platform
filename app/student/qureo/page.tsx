"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  KeyRound,
  ExternalLink,
  Loader2,
  Copy,
  CheckCircle2,
  X,
  AlertCircle,
  MonitorPlay,
} from "lucide-react";

type QureoAccount = {
  id: string;
  student_code: string;
  student_name: string;
  qureo_username: string;
  qureo_password: string;
};

export default function StudentQureoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<QureoAccount[]>([]);
  const [filtered, setFiltered] = useState<QureoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCodes, setShowCodes] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // تحميل بيانات المستخدم
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

  // تحميل الأكواد
  const loadAccounts = async () => {
    try {
      const res = await fetch("/api/qureo");
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
        setFiltered(data.accounts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // تشغيل التحميل لما المستخدم يجهز
  useEffect(() => {
    if (user) loadAccounts();
  }, [user]);

  // فلترة البحث
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(accounts);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      accounts.filter(
        (a) =>
          a.student_name.toLowerCase().includes(q) ||
          a.student_code.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, accounts]);

  // نسخ النص
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-[#1F4A3F]">
                منصة Qureo للبرمجة 🚀
              </h1>
              <p className="text-sm text-gray-500">
                أكوادك الخاصة للدخول على المنصة
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

        {/* البطاقتين */}
        {!showCodes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* كارت الأكواد */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowCodes(true)}
              className="group p-8 rounded-3xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <KeyRound className="w-8 h-8 text-[#C9A227]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">أكواد المنصة</h2>
              <p className="text-white/70">
                اضغط هنا عشان تشوف اسم المستخدم وكلمة المرور بتاعتك.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[#C9A227] font-medium">
                <span>عرض الأكواد</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>

            {/* كارت المنصة */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              href="https://me-portal.qureo.education/login"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-[#1F4A3F] cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">منصة Qureo</h2>
              <p className="text-gray-500">
                اضغط هنا عشان تفتح الموقع الرسمي وتدخل بالكود بتاعك.
              </p>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 font-medium">
                <span>فتح المنصة</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.a>
          </div>
        ) : (
          /* صفحة الأكواد */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setShowCodes(false)}
              className="mb-4 flex items-center gap-2 text-sm text-[#1F4A3F] hover:text-[#C9A227] font-medium transition"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع للبطاقتين
            </button>

            {/* البحث */}
            <div className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm mb-6">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسمك أو كودك..."
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

            {/* قائمة الأكواد */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#1F4A3F] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/80 backdrop-blur border border-white/60 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "مفيش نتائج مطابقة" : "لسه مفيش أكواد مرفوعة"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((acc, i) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-5 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-[#1F4A3F]">
                          {acc.student_name}
                        </h3>
                        <p className="font-mono text-xs text-gray-500">
                          {acc.student_code}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Username */}
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                        <p className="text-xs text-indigo-600 mb-1">اسم المستخدم</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono font-bold text-[#1F4A3F]" dir="ltr">
                            {acc.qureo_username}
                          </p>
                          <button
                            onClick={() => copyToClipboard(acc.qureo_username, `u-${acc.id}`)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
                          >
                            {copied === `u-${acc.id}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-xs text-emerald-600 mb-1">كلمة المرور</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono font-bold text-[#1F4A3F]" dir="ltr">
                            {acc.qureo_password}
                          </p>
                          <button
                            onClick={() => copyToClipboard(acc.qureo_password, `p-${acc.id}`)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition"
                          >
                            {copied === `p-${acc.id}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}