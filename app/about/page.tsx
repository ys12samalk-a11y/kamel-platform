"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Sparkles,
  Award,
  Heart,
  MapPin,
  Briefcase,
  Quote,
  Users,
} from "lucide-react";

export default function AboutPage() {
  const timeline = [
    {
      year: "1974",
      title: "بداية المسيرة",
      desc: "عمل مسؤولًا في مكتب مخابرات شرم الشيخ ورأس النقب.",
      icon: Briefcase,
    },
    {
      year: "1980s",
      title: "خبير المساحة",
      desc: "برع في المساحة والطبوغرافيا في سيناء، وأصبح من أهم خبراء مصر.",
      icon: MapPin,
    },
    {
      year: "1986",
      title: "مفاوضات طابا",
      desc: "اختير ضمن الوفد العسكري المصري في مفاوضات طابا، وكان أصغر أعضاء الوفد سنًا.",
      icon: Award,
    },
    {
      year: "13 أغسطس 1986",
      title: "الاستشهاد",
      desc: "استُشهد على طاولة المفاوضات بعد 3 أيام متواصلة من العمل، بأزمة قلبية.",
      icon: Heart,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFBFC] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/60 backdrop-blur-xl border-b border-white/40 z-50 shadow-sm shadow-emerald-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1F4A3F]">منصة الحويج</h1>
              <p className="text-[11px] text-gray-500">
                مدرسة الشهيد محمد كامل الحويج
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-medium hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            الرئيسية
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-12 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-amber-200/60 text-amber-700 text-sm font-medium mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              🕊️ في ذكرى الشهيد
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative mx-auto mb-10 w-fit"
            >
              <div className="absolute inset-0 rounded-full bg-[#C9A227]/30 blur-3xl scale-110" />
              <div className="relative p-2 rounded-full bg-gradient-to-br from-[#C9A227] via-[#E0BC3E] to-[#C9A227] shadow-2xl">
                <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden bg-[#0F2A24]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/martyr.png"
                    alt="الشهيد محمد كامل الحويج"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-[#1F4A3F] mb-6 leading-tight">
              الشهيد
              <br />
              <span className="bg-gradient-to-l from-[#C9A227] via-[#E0BC3E] to-[#C9A227] bg-clip-text text-transparent">
                محمد كامل الحويج
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
              رائد في الجيش المصري، وعضو فريق مفاوضات استرداد طابا.
              استُشهد على طاولة المفاوضات وهو يدافع عن كل شبر من أرض الوطن.
            </p>

            <div className="inline-block px-6 py-3 rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-[#1F4A3F]">13 أغسطس 1986</span>
                {" — "}
                <span>عن عمر يناهز 34 عامًا</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 my-12">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
      </div>

      {/* Personal Info */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Users,
              label: "الاسم الكامل",
              value: "محمد كامل أحمد عبد الله الحويج",
            },
            {
              icon: MapPin,
              label: "مسقط الرأس",
              value: "مركز جهينة — سوهاج",
            },
            {
              icon: Briefcase,
              label: "المهنة",
              value: "رائد بالجيش المصري",
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1F4A3F]/10 flex items-center justify-center mx-auto mb-3">
                <c.icon className="w-5 h-5 text-[#1F4A3F]" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className="font-bold text-[#1F4A3F] text-sm leading-snug">
                {c.value}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F4A3F] text-center mb-4"
          >
            قصة الشهيد
          </motion.h2>
          <p className="text-center text-gray-600 mb-12">
            مسيرة عطاء انتهت بشهادة على طاولة المفاوضات
          </p>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-7 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F]">
                  المسيرة العسكرية
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                كان الرائد محمد كامل الحويج ضابط اتصال في جهاز الاتصال
                العسكري المصري مع الهيئات الدولية، التابع للمخابرات
                الحربية. عمل مسؤولًا في مكتب مخابرات «شرم الشيخ» و«رأس
                النقب» منذ عام 1974. وبسبب إتقانه وإخلاصه الشديد في عمله،
                وخاصة في مجال المساحة والطبوغرافيا في شبه جزيرة سيناء،
                اختير ضمن الوفد الرسمي العسكري المصري المشارك في مفاوضات
                طابا مع الاحتلال الإسرائيلي، وكان أصغر أعضاء الوفد سنًا.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-7 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F]">
                  مفاوضات طابا
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                عُقدت المباحثات في مدينة هيرتزيليا شمال تل أبيب المحتلة،
                بهدف المسح الميداني وتسجيل العلامات الحدودية المتنازع
                عليها، وبشكل خاص العلامة 91 التي تقع عند طابا. ترأس الوفد
                وقتها السفير نبيل العربي من الجانب السياسي، واللواء أركان
                حرب فاروق لبيب، رئيس جهاز الاتصال العسكري المصري في
                المفاوضات.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-7 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F]">
                  يوم الاستشهاد
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                في يوم 13 أغسطس 1986، استمر الاجتماع بين الوفدين المصري
                والإسرائيلي لساعات طويلة، بعد يومين من المفاوضات الشاقة.
                وأثناء المفاوضات، وضع الحويج رأسه على طاولة المفاوضات،
                بعدما ظل مستيقظًا 3 أيام متواصلة. كان يجلس بجانب الدكتور
                مفيد شهاب، والذي اعتقد أنه يلتقط أنفاسه، ولكن عندما كلمه
                ليطمئن عليه وجده لا يرد. اكتشف الوفد المصري بعدها وفاته
                المفاجئة بسبب أزمة قلبية لم تدم إلا 14 ثانية حسب التقرير
                الطبي، مع محاولات إنعاش القلب لمدة ساعتين إلا أنها باءت
                بالفشل. صعدت روحه إلى بارئها عن عمر 34 عامًا.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Last Message */}
      <section className="py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto p-10 md:p-14 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white text-center relative overflow-hidden shadow-2xl shadow-emerald-900/20"
        >
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#C9A227]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">
            <Quote className="w-12 h-12 text-[#C9A227] mx-auto mb-6" />
            <p className="text-sm text-[#C9A227] mb-4">آخر رسالة</p>
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
              «أنا راجع من مفاوضات طابا
              <br />
              حتى أعيد معاكم»
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent mb-5" />
            <p className="text-white/60 text-sm">
              آخر رسالة بعثها الشهيد إلى زوجته
              <br />
              قبل سفره بيومين، وقبل أن يعود ملفوفًا بعلم مصر
            </p>
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F4A3F] text-center mb-4"
          >
            مسيرة العطاء
          </motion.h2>
          <p className="text-center text-gray-600 mb-12">
            محطات في حياة الشهيد
          </p>

          <div className="relative">
            <div className="absolute right-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#C9A227]/40 via-[#C9A227]/20 to-transparent" />

            <div className="space-y-8">
              {timeline.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pr-16"
                >
                  <div className="absolute right-0 top-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] flex items-center justify-center shadow-lg">
                    <t.icon className="w-5 h-5 text-[#C9A227]" />
                  </div>
                  <div className="p-6 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#C9A227]/10 text-[#C9A227] text-xs font-bold mb-2">
                      {t.year}
                    </span>
                    <h3 className="font-bold text-lg text-[#1F4A3F] mb-2">
                      {t.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Family */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow-sm text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1F4A3F] mb-4">
              تَرَك ورائه
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              تَرَك الشهيد زوجته وولدين:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-5 rounded-2xl bg-[#1F4A3F]/5 border border-[#1F4A3F]/10">
                <p className="font-bold text-[#1F4A3F] text-lg mb-1">إسلام</p>
                <p className="text-xs text-gray-500">كان عمره سنتين</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#1F4A3F]/5 border border-[#1F4A3F]/10">
                <p className="font-bold text-[#1F4A3F] text-lg mb-1">أحمد</p>
                <p className="text-xs text-gray-500">كان عمره 40 يومًا فقط</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1F4A3F] text-center mb-4"
          >
            قيم نعتز بها
          </motion.h2>
          <p className="text-center text-gray-600 mb-14">
            من سيرة الشهيد نستلهم معاني عظيمة
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "التضحية",
                desc: "قدّم حياته فداءً للوطن، وعمل حتى آخر لحظة على طاولة المفاوضات.",
                color: "from-rose-400 to-pink-500",
              },
              {
                icon: Award,
                title: "الإخلاص",
                desc: "ظل مستيقظًا 3 أيام متواصلة من أجل استرداد كل شبر من أرض الوطن.",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: MapPin,
                title: "الوطنية",
                desc: "كان أصغر أعضاء الوفد سنًا، وأكثرهم إصرارًا على استرداد طابا.",
                color: "from-emerald-400 to-teal-500",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-8 rounded-3xl bg-white/80 backdrop-blur border border-white/60 hover:border-[#C9A227]/30 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all text-center"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}
                >
                  <c.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F] mb-3">
                  {c.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl bg-gradient-to-br from-[#1F4A3F] via-[#1a3f36] to-[#0F2A24] text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C9A227]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🕊️</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                رسالة إلى الأجيال
              </h3>
            </div>
            <p className="text-white/80 text-lg leading-relaxed text-center max-w-2xl mx-auto mb-6">
              ظل اسم الشهيد محمد كامل الحويج غائبًا عن التكريم الرسمي
              لأسباب سياسية، لكن ذكراه باقية في قلوب كل من عرفه، وفي
              وجدان كل مصري يؤمن بأن الوطن يُبنى بالتضحية.
            </p>
            <p className="text-white/80 text-lg leading-relaxed text-center max-w-2xl mx-auto">
              سُميت مدرسة في مركز جهينة بمحافظة سوهاج باسمه — مسقط رأسه
              — لتبقى ذكراه حيّة، وليتعلم كل طالب فيها معنى الوطنية
              والتضحية.
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
            <p className="mt-6 text-[#C9A227] font-medium text-center">
              مدرسة الشهيد محمد كامل الحويج
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] text-white font-semibold hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-1"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            العودة للرئيسية
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}