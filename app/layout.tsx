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
  title: "منصة الحويج | مدرسة الشهيد محمد كامل الحويج",
  description:
    "منصة الحويج — تجمع كل حاجة في مكان واحد لمدرسة الشهيد محمد كامل الحويج",
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