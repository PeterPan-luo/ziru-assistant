import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '自如助手 - 智能日程与费用管理',
  description: '基于AI的智能日程与费用管理助手，支持自然语言交互',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
