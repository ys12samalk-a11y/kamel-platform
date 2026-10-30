import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import AIAssistant from "@/components/AIAssistant";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "منصة الحويج | مدرسة الشهيد محمد كامل الحويج الثانوية",
    template: "%s | منصة الحويج"
  },
  description: "المنصة الرسمية لمدرسة الشهيد محمد كامل الحويج الثانوية. تواصل مع المدرسين، شوف جدول الحصص، اعرض مواهبك، واستخدم المساعد الذكي. المنصة الشاملة لطلاب ومدرسي المدرسة.",
  keywords: [
    "منصة الحويج", 
    "الشهيد محمد كامل الحويج", 
    "مدرسة الشهيد محمد كامل الحويج الثانوية", 
    "مدرسة الحويج", 
    "منصة مدرسة الحويج",
    "تعليم",
    "مدرسة ثانوية"
  ],
  authors: [{ name: "ياسا ملاك لبس" }],
  creator: "ياسا ملاك لبس",
  publisher: "مدرسة الشهيد محمد كامل الحويج",
  openGraph: {
    title: "منصة الحويج | مدرسة الشهيد محمد كامل الحويج",
    description: "المنصة الشاملة لطلاب ومدرسي مدرسة الشهيد محمد كامل الحويج. جدول الحصص، المواهب، والمساعد الذكي في مكان واحد.",
    url: "https://kamel-platform.vercel.app",
    siteName: "منصة الحويج",
    locale: "ar_EG",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
    verification: {
    google: "NURFMCpLo0-vM5sdc79Ff4w_wulEHydk41ir5uVBLnc", // حط الكود اللي جوجل أداه لك هنا
  },
};