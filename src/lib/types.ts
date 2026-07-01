export interface School {
  id: string
  code: string
  name: string
  short: string
  province_id: string
  province_name: string
  city_name: string
  town_name: string
  level: string
  level_name: string
  type: string
  type_name: string
  nature: string
  nature_name: string
  belong: string
  f985: string
  f211: string
  dual_class: string
  dual_class_name: string
  create_date: string
  area: number
  content: string
  site: string
  school_site: string
  phone: string
  email: string
  address: string
  postcode: string
  ruanke_rank: string
  xyh_rank: string
  qs_world: string
  us_rank: string
  num_master: string
  num_doctor: string
  num_subject: string
  num_academician: string
  num_library: string
  num_lab: string
  label_list: { name: string; key: string; value: string }[]
  attr_list: string[]
  special: SchoolSpecial[]
  province_score_min: Record<string, ProvinceScoreMin>
  pro_type_min: Record<string, ProTypeMinItem[]>
  pro_type: Record<string, string[]>
}

export interface SchoolSpecial {
  special_id: string
  special_name: string
  level_name: string
  limit_year: string
  nation_feature: string
  province_feature: string
}

export interface ProvinceScoreMin {
  province_id: string
  type: string
  min: string
  year: string
}

export interface ProTypeMinItem {
  year: number
  type: Record<string, string>
}

export interface ScoreRecord {
  school_id: string
  school_name: string
  year: number
  local_province_name: string
  local_batch_name: string
  local_type_name: string
  sp_name: string
  spname: string
  min: number
  max: number
  average: string
  min_section: number
  zslx_name: string
  level2_name: string
  level3_name: string
  sg_info: string
  info: string
}

export interface FaqSchool {
  id: string
  name: string
  answers: FaqAnswer[]
}

export interface FaqAnswer {
  question: string
  question_short: string
  answers: FaqResponse[]
}

export interface FaqResponse {
  user: string
  year: number
  answer: string
}

export interface ProvinceInfo {
  province_id: string
  province_name: string
}

export interface BatchInfo {
  batch_id: string
  batch_name: string
}

export interface TypeInfo {
  type_id: string
  type_name: string
}

export interface SchoolIndices {
  bed_type?: number
  air_con?: number
  bathroom?: number
  self_study?: number
  morning_run?: number
  running_km?: number
  holiday?: number
  delivery?: number
  traffic?: number
  washer?: number
  internet?: number
  power_cut?: number
  canteen?: number
  hot_water?: number
  ebike?: number
  power_limit?: number
  night_study?: number
  laptop?: number
  access?: number
  inspection?: number
}

export interface IndexRange {
  min: number
  max: number
}

export interface SearchIndex {
  id: string
  name: string
  short: string
  province: string
  level: string
  tags: string[]
  ruanke: string
  min_score: string
  indices?: SchoolIndices
  ranges?: Partial<Record<keyof SchoolIndices, IndexRange>>
}

export const INDEX_META: { key: keyof SchoolIndices; label: string; unit: string; type: "score" | "numeric" }[] = [
  { key: "air_con", label: "空调", unit: "", type: "score" },
  { key: "bed_type", label: "上床下桌", unit: "", type: "score" },
  { key: "bathroom", label: "独立卫浴", unit: "", type: "score" },
  { key: "self_study", label: "无早自习", unit: "", type: "score" },
  { key: "morning_run", label: "无晨跑", unit: "", type: "score" },
  { key: "running_km", label: "跑步", unit: "km", type: "numeric" },
  { key: "holiday", label: "假期", unit: "天", type: "numeric" },
  { key: "delivery", label: "外卖", unit: "", type: "score" },
  { key: "traffic", label: "交通", unit: "", type: "score" },
  { key: "washer", label: "洗衣机", unit: "", type: "score" },
  { key: "internet", label: "校园网", unit: "", type: "score" },
  { key: "power_cut", label: "不断电", unit: "", type: "score" },
  { key: "canteen", label: "食堂", unit: "", type: "score" },
  { key: "hot_water", label: "热水", unit: "h", type: "numeric" },
  { key: "ebike", label: "电瓶车", unit: "", type: "score" },
  { key: "night_study", label: "通宵自习", unit: "", type: "score" },
  { key: "laptop", label: "带电脑", unit: "", type: "score" },
  { key: "access", label: "门禁", unit: "", type: "score" },
  { key: "inspection", label: "查寝", unit: "", type: "score" },
  { key: "power_limit", label: "限电", unit: "W", type: "numeric" },
]

export interface FilterOptions {
  provinces: ProvinceInfo[]
  batches: BatchInfo[]
  types: TypeInfo[]
}

export const SCHOOL_LEVELS: Record<string, string> = {
  "2001": "本科",
  "2002": "专科（高职）",
  "2003": "成人高校",
}

export const SCHOOL_TYPES: Record<string, string> = {
  "5001": "理工类",
  "5002": "综合类",
  "5003": "语言类",
  "5004": "艺术类",
  "5005": "农林类",
  "5006": "民族类",
  "5007": "医药类",
  "5008": "师范类",
  "5009": "财经类",
  "5010": "体育类",
  "5011": "政法类",
  "5012": "军事类",
  "5013": "其他",
}

export const SCHOOL_NATURES: Record<string, string> = {
  "36000": "公办",
  "36001": "民办",
  "36002": "内地与港澳台地区合作办学",
  "36003": "中外合作办学",
}
