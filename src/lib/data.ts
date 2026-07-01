/**
 * 服务端数据加载模块
 * 使用模块级缓存避免多次构建时重复读取磁盘
 */
import fs from "fs"
import path from "path"
import type { School, FaqSchool, SearchIndex, SchoolIndices, IndexRange } from "./types"

let _schools: School[] | null = null
let _faq: FaqSchool[] | null = null
let _searchIndex: SearchIndex[] | null = null
let _schoolIndices: Record<string, SchoolIndices> | null = null
let _schoolRanges: Record<string, Partial<Record<keyof SchoolIndices, IndexRange>>> | null = null
let _faqByName: Map<string, FaqSchool> | null = null

const dataDir = path.join(process.cwd(), "data")

/** 加载所有学校数据（带缓存） */
export function loadSchools(): School[] {
  if (!_schools) {
    _schools = JSON.parse(
      fs.readFileSync(path.join(dataDir, "schools.json"), "utf-8")
    )
  }
  return _schools!
}

/** 加载所有 FAQ 数据（带缓存） */
export function loadFaq(): FaqSchool[] {
  if (!_faq) {
    _faq = JSON.parse(
      fs.readFileSync(path.join(dataDir, "faq.json"), "utf-8")
    )
  }
  return _faq!
}

/**
 * 加载学校生活质量指数
 * 同时构建 school_indices 和 _schoolRanges 两个缓存
 * 注意：必须先调用此函数，_schoolRanges 才会被填充
 */
export function loadSchoolIndices(): Record<string, SchoolIndices> {
  if (!_schoolIndices) {
    const raw: Record<string, { name: string; indices: SchoolIndices; ranges?: Record<string, IndexRange> }> = JSON.parse(
      fs.readFileSync(path.join(dataDir, "school_indices.json"), "utf-8")
    )
    _schoolIndices = {}
    _schoolRanges = {}
    for (const [sid, school] of Object.entries(raw)) {
      _schoolIndices[sid] = school.indices
      _schoolRanges[sid] = (school.ranges as Record<string, IndexRange>) || {}
    }
  }
  return _schoolIndices!
}

/** 加载搜索索引（带缓存） */
export function loadSearchIndex(): SearchIndex[] {
  if (!_searchIndex) {
    _searchIndex = JSON.parse(
      fs.readFileSync(path.join(dataDir, "search-index.json"), "utf-8")
    )
  }
  return _searchIndex!
}

/** 加载搜索索引并附加生活质量指数数据 */
export function loadSearchIndexWithIndices(): SearchIndex[] {
  const idx = loadSearchIndex()
  const indices = loadSchoolIndices()
  return idx.map((s) => ({
    ...s,
    indices: indices[s.id] || undefined,
    ranges: (_schoolRanges && _schoolRanges[s.id]) || undefined,
  }))
}

/** 根据 ID 查找学校 */
export function getSchoolById(id: string): School | undefined {
  return loadSchools().find((s) => s.id === id)
}

/** 根据学校名称查找 FAQ 数据（使用学校名匹配，含缓存） */
export function getFaqBySchoolName(name: string): FaqSchool | undefined {
  if (!_faqByName) {
    _faqByName = new Map()
    const schoolNames = new Set(loadSchools().map((s) => s.name))
    for (const f of loadFaq()) {
      if (schoolNames.has(f.name)) {
        _faqByName.set(f.name, f)
      }
    }
  }
  return _faqByName!.get(name)
}

/** 获取所有学校 ID（用于 SSG 静态生成） */
export function getAllSchoolIds(): string[] {
  return loadSchools().map((s) => s.id)
}
