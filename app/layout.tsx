import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "สวนภารกิจเด็กดี | แบบฝึกหัดแสนสนุก ป.2",
  description: "เกมทบทวนเรื่องสมาชิกในบ้านและการช่วยเหลืองานบ้าน สำหรับนักเรียนชั้น ป.2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
