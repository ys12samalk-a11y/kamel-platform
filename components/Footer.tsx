import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F4A3F] text-white pt-12 pb-6 px-6 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
            </div>
            <span className="font-bold text-lg">منصة الحويج</span>
          </div>
          <p className="text-white/60 text-sm">
            منصة تجمع كل حاجة لمدرسة الشهيد محمد كامل الحويج
          </p>
        </div>

        <div className="h-px bg-white/10 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © 2025 منصة الحويج — مدرسة الشهيد محمد كامل الحويج
          </p>

          <p className="text-[10px] tracking-[0.25em] text-[#C9A227]/35 font-light select-none hover:text-[#C9A227]/60 transition-colors duration-500">
            تصميم وتطوير — يسى ملاك لبس
          </p>
        </div>
      </div>
    </footer>
  );
}