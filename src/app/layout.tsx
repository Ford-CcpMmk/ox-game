import type { Metadata } from "next";
import { Fredoka, Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-prompt",
});

const fredoka = Fredoka({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "OX Game",
  description: "เกม OX ผู้เล่นกับบอท พร้อมระบบคะแนน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-theme="pastel" className={`${prompt.className} ${prompt.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
