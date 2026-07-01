import { loadSearchIndexWithIndices } from "@/lib/data"
import HomeClient from "@/components/HomeClient"

/**
 * 首页（SSG）
 * 在构建时预加载搜索索引和指数数据
 */
export default function HomePage() {
  const schools = loadSearchIndexWithIndices()
  return <HomeClient schools={schools} />
}
