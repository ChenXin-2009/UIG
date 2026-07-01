/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true }, // logo 图片已由 gaokao.cn CDN 处理，无需 Next.js 图片优化
  webpack: (config) => { config.cache = false; return config }, // SSG 构建中禁用 webpack 缓存避免 stale 数据
}
module.exports = nextConfig
