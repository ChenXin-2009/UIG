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

export interface SearchIndex {
  id: string
  name: string
  short: string
  province: string
  level: string
  tags: string[]
  ruanke: string
  min_score: string
}

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
