import { loadSchools, loadSearchIndex } from "@/lib/data"
import CompareClient from "@/components/CompareClient"

/**
 * 学校对比页（SSG）
 * 预加载精简学校数据和搜索索引
 */
export default function ComparePage() {
  const searchIndex = loadSearchIndex()
  const allSchools = loadSchools()

  const compact = allSchools.map((s) => ({
    id: s.id,
    name: s.name,
    province_id: s.province_id,
    province_name: s.province_name,
    level_name: s.level_name,
    nature_name: s.nature_name,
    type_name: s.type_name,
    city_name: s.city_name,
    f985: s.f985,
    f211: s.f211,
    dual_class_name: s.dual_class_name,
    ruanke_rank: s.ruanke_rank,
    xyh_rank: s.xyh_rank,
    qs_world: s.qs_world,
    // 只保留北京(11)、上海(31)、广东(44)三地最低分以控制构建产物体积
    province_score_min: s.province_score_min
      ? { "11": s.province_score_min["11"], "31": s.province_score_min["31"], "44": s.province_score_min["44"] }
      : undefined,
  }))

  return <CompareClient searchIndex={searchIndex} schoolsCompact={compact} />
}
