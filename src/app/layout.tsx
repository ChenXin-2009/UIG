import type { Metadata } from "next"
import "./globals.css"

/** 全局 SEO 元数据 */
export const metadata: Metadata = {
  title: "高考志愿助手 - 大学信息查询",
  description: "查询全国大学基本信息、录取分数线、校园生活问答",
  icons: [{ rel: "icon", url: "/LOGO1.png" }],
}

/** 根布局，设置中文语言 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
