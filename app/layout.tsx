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
    template: "%s | منصة الحويج",
  },
  description:
    "المنصة الرسمية لمدرسة الشهيد محمد كامل الحويج الثانوية. تواصل مع المدرسين، شوف جدول الحصص، اعرض مواهبك، واستخدم المساعد الذكي.",
  keywords: [
    "منصة الحويج",
    "الشهيد محمد كامل الحويج",
    "مدرسة الشهيد محمد كامل الحويج الثانوية",
    "مدرسة الحويج",
    "منصة مدرسة الحويج",
  ],
  authors: [{ name: "ياسا ملاك لبس" }],
  creator: "ياسا ملاك لبس",
  publisher: "مدرسة الشهيد محمد كامل الحويج",
  // ✨ كود التحقق من جوجل
  verification: {
    google: "NURFMCpLo0-vM5sdc79Ff4w_wulEHydk41ir5uVBLnc",
  },
  openGraph: {
    title: "منصة الحويج | مدرسة الشهيد محمد كامل الحويج",
    description:
      "المنصة الشاملة لطلاب ومدرسي مدرسة الشهيد محمد كامل الحويج. جدول الحصص، المواهب، والمساعد الذكي في مكان واحد.",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo bg-white text-gray-900">
        {children}
        <AIAssistant />
      </body>
    </html>
  );
}