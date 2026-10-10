"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import {
  Calendar,
  Bot,
  Trophy,
  Star,
  MessageSquare,
  BookOpen,
  LogIn,
  Sparkles,
  ArrowLeft,
  Users,
  Award,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "جدول الحصص",
    desc: "شوف جدولك في أي وقت ومن أي مكان",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Bot,
    title: "مساعد ذكي",
    desc: "اسأل أي حاجة والذكاء الاصطناعي يجاوبك",
    color: "from-purple-400 to-indigo-500",
  },
  {
    icon: Star,
    title: "قسم المواهب",
    desc: "اعرض موهبتك للعالم واكسب إعجاب زمايلك",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Trophy,
    title: "المسابقات",
    desc: "شارك في المسابقات واكسب جوائز",
    color: "from-rose-400 to-pink-500",
  },
  {
    icon: BookOpen,
    title: "المكتبة",
    desc: "ملفات ومذكرات جاهزة للتحميل",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: MessageSquare,
    title: "شكاوى واقتراحات",
    desc: "صوتك مسموع دائمًا للإدارة",
    color: "from-cyan-400 to-teal-500",
  },
];

const stats = [
  { value: "1000+", label: "حساب", icon: Users },
  { value: "20+", label: "ميزة", icon: Award },
  { value: "50+", label: "موهبة", icon: Star },
  { value: "24/7", label: "متاح", icon: Zap },
];

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#FAFBFC]">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 -left-32 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-xl border-b border-white/40 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1F4A3F]">منصة الحويج</h1>
              <p className="text-[11px] text-gray-500">
                مدرسة الشهيد محمد كامل الحويج
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-medium hover:shadow-lg transition-all"
          >
            <LogIn className="w-4 h-4" />
            تسجيل دخول
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-44 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-amber-200/60 text-amber-700 text-sm font-medium mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              منصة ذكية لمدرستك
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#1F4A3F] mb-8 leading-[1.15] tracking-tight">
              مدرسة الشهيد
              <br />
              <span className="bg-gradient-to-l from-[#C9A227] via-[#E0BC3E] to-[#C9A227] bg-clip-text text-transparent">
                محمد كامل الحويج
              </span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-700">
                ترحب بكم 👋
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              منصة الحويج — كل حاجة محتاجها في مكان واحد.
              <br className="hidden md:block" />
              جدولك، مواعيدك، موهبتك، ومساعد ذكي بيجاوب على كل أسئلتك.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/login"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                ابدأ الآن
                <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-2xl bg-white/80 backdrop-blur border-2 border-[#1F4A3F]/20 text-[#1F4A3F] font-semibold hover:border-[#1F4A3F] hover:shadow-xl transition-all hover:-translate-y-1"
              >
                عن الشهيد
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Martyr Memorial */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] p-10 md:p-14 shadow-2xl"
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-block px-4 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-medium mb-8">
                🕊️ في ذكرى الشهيد
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-[#C9A227]/30 blur-3xl scale-110" />
                <div className="relative p-2 rounded-full bg-gradient-to-br from-[#C9A227] via-[#E0BC3E] to-[#C9A227] shadow-2xl">
                  <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden bg-[#0F2A24]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/martyr.png"
                      alt="الشهيد محمد كامل الحويج"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                الشهيد
                <br />
                <span className="text-[#C9A227]">محمد كامل الحويج</span>
              </h2>

              <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                ابن من أبناء مصر البارّين، ضحّى بحياته فداءً لوطنه.
                ستبقى ذكراه خالدة في قلوبنا.
              </p>

              <Link
                href="/about"
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#C9A227] text-[#1F4A3F] font-bold hover:bg-[#E0BC3E] transition-all hover:-translate-y-1 shadow-lg"
              >
                اعرف أكثر
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm text-center"
              >
                <s.icon className="w-5 h-5 text-[#C9A227] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#1F4A3F]">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1F4A3F] mb-4">
              إيه اللي هتلاقيه في منصة الحويج؟
            </h2>
            <p className="text-gray-600 text-lg">
              كل حاجة محتاجها، مصممة بذكاء وبساطة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="group p-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/30 shadow-sm hover:shadow-2xl transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F] mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white text-center relative overflow-hidden"
        >
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              جاهز تبدأ رحلتك؟ 🚀
            </h3>
            <p className="text-white/80 mb-8 text-lg">
              سجّل دخولك واستمتع بكل مميزات منصة الحويج
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#C9A227] text-[#1F4A3F] font-bold hover:bg-[#E0BC3E] transition-all hover:-translate-y-1 shadow-lg"
            >
              ابدأ الآن
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}