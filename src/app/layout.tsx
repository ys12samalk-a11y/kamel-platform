import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "كامل | مدرسة الشهيد محمد كامل الحويج",
  description: "منصة تجمع كل حاجة — جدول، مواهب، مساعد ذكي، وأكتر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}