import Link from "next/link";
import {
  Calendar,
  Bot,
  Trophy,
  Star,
  MessageSquare,
  BookOpen,
  LogIn,
  Sparkles,
  Users,
  Award,
  ArrowLeft,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "جدول الحصص",
    desc: "شوف جدولك الأسبوعي في أي وقت ومن أي مكان",
  },
  {
    icon: Bot,
    title: "مساعد ذكي",
    desc: "اسأل أي حاجة والذكاء الاصطناعي هيرد عليك",
  },
  {
    icon: Star,
    title: "قسم المواهب",
    desc: "اعرض موهبتك وتفاعل مع مواهب زمايلك",
  },
  {
    icon: Trophy,
    title: "المسابقات",
    desc: "شارك في المسابقات واكسب جوائز",
  },
  {
    icon: BookOpen,
    title: "المكتبة الرقمية",
    desc: "ملفات ومذكرات لكل المواد",
  },
  {
    icon: MessageSquare,
    title: "شكاوى واقتراحات",
    desc: "صوتك مسموع — ابعت واقترح براحتك",
  },
];

const stats = [
  { number: "500+", label: "طالب" },
  { number: "50+", label: "مدرس" },
  { number: "100+", label: "موهبة" },
  { number: "20+", label: "نشاط" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1F4A3F] flex items-center justify-center shadow-lg shadow-[#1F4A3F]/20">
              <Sparkles className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1F4A3F] leading-tight">
                كامل
              </h1>
              <p className="text-xs text-gray-500">
                مدرسة الشهيد محمد كامل الحويج
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F4A3F] text-white font-medium hover:bg-[#2E6B5A] transition-all duration-300 shadow-md shadow-[#1F4A3F]/20"
          >
            <LogIn className="w-4 h-4" />
            تسجيل دخول
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#C9A227]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 left-10 w-96 h-96 bg-[#1F4A3F]/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A227]/10 text-[#C9A227] text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              منصة ذكية لمدرستك
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#1F4A3F] mb-6 leading-tight">
              كامل...
              <br />
              <span className="text-[#C9A227]">منصة تجمع كل حاجة</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              جدولك، مواعيدك، موهبتك، ومساعد ذكي بيجاوب على كل أسئلتك — كل ده
              في مكان واحد.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/login"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-[#1F4A3F] text-white font-bold hover:bg-[#2E6B5A] transition-all duration-300 shadow-xl shadow-[#1F4A3F]/30 hover:shadow-2xl hover:shadow-[#1F4A3F]/40 hover:-translate-y-0.5"
              >
                ابدأ الآن
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about-martyr"
                className="px-8 py-4 rounded-xl border-2 border-[#1F4A3F] text-[#1F4A3F] font-bold hover:bg-[#1F4A3F] hover:text-white transition-all duration-300"
              >
                عن الشهيد
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-[#1F4A3F] mb-2">
                {s.number}
              </div>
              <div className="text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1F4A3F] mb-4">
              إيه اللي هتلاقيه في كامل؟
            </h2>
            <p className="text-lg text-gray-600">
              كل حاجة محتاجها في مكان واحد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#C9A227]/50 hover:shadow-2xl hover:shadow-[#C9A227]/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1F4A3F]/10 group-hover:bg-[#1F4A3F] flex items-center justify-center mb-6 transition-colors duration-300">
                  <f.icon className="w-7 h-7 text-[#1F4A3F] group-hover:text-[#C9A227] transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-xl text-[#1F4A3F] mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1F4A3F] to-[#2E6B5A] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A227]/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              مستعد تبدأ؟
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              سجل دخول دلوقتي وادخل على منصتك
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C9A227] text-white font-bold hover:bg-[#E0BC3E] transition-all duration-300 shadow-xl"
            >
              <LogIn className="w-5 h-5" />
              تسجيل دخول
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F4A3F] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#1F4A3F]" />
            </div>
            <span className="text-xl font-bold">كامل</span>
          </div>
          <p className="text-sm opacity-80 mb-2">
            © 2025 منصة كامل — مدرسة الشهيد محمد كامل الحويج
          </p>
          <p className="text-xs opacity-60">
            رحم الله الشهيد وأسكنه فسيح جناته 🤍
          </p>
        </div>
      </footer>
    </main>
  );
}