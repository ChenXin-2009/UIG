/** 中国省级行政区列表（教育部地区代码） */
export const PROVINCES: { id: string; name: string }[] = [
  { id: "11", name: "北京" }, { id: "12", name: "天津" }, { id: "13", name: "河北" },
  { id: "14", name: "山西" }, { id: "15", name: "内蒙古" }, { id: "21", name: "辽宁" },
  { id: "22", name: "吉林" }, { id: "23", name: "黑龙江" }, { id: "31", name: "上海" },
  { id: "32", name: "江苏" }, { id: "33", name: "浙江" }, { id: "34", name: "安徽" },
  { id: "35", name: "福建" }, { id: "36", name: "江西" }, { id: "37", name: "山东" },
  { id: "41", name: "河南" }, { id: "42", name: "湖北" }, { id: "43", name: "湖南" },
  { id: "44", name: "广东" }, { id: "45", name: "广西" }, { id: "46", name: "海南" },
  { id: "50", name: "重庆" }, { id: "51", name: "四川" }, { id: "52", name: "贵州" },
  { id: "53", name: "云南" }, { id: "54", name: "西藏" }, { id: "61", name: "陕西" },
  { id: "62", name: "甘肃" }, { id: "63", name: "青海" }, { id: "64", name: "宁夏" },
  { id: "65", name: "新疆" },
]

/** ID -> 省份名称的快速查找表 */
export const PROVINCE_MAP: Record<string, string> = Object.fromEntries(
  PROVINCES.map((p) => [p.id, p.name])
)

/** 高考科类标签映射 */
export const TYPE_LABELS: Record<string, string> = {
  "1": "理科", "2": "文科", "3": "综合",
  "2073": "物理类", "2074": "历史类",
}

/** 标签颜色映射 */
export const TAG_COLORS: Record<string, string> = {
  "985": "#e74c3c", "211": "#f39c12", "双一流": "#8e44ad",
  "公办": "#27ae60", "民办": "#95a5a6",
  "本科": "#2980b9", "专科": "#7f8c8d",
}
