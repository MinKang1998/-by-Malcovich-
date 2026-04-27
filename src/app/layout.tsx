import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "한글 워들 - Korean Wordle",
  description: "한글 자모 단위로 즐기는 한국어 워들 게임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
