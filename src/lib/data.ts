import fs from "fs"
import path from "path"
import type { School, FaqSchool, SearchIndex } from "./types"

let _schools: School[] | null = null
let _faq: FaqSchool[] | null = null
let _searchIndex: SearchIndex[] | null = null
let _faqByName: Map<string, FaqSchool> | null = null

const dataDir = path.join(process.cwd(), "data")

export function loadSchools(): School[] {
  if (!_schools) {
    _schools = JSON.parse(
      fs.readFileSync(path.join(dataDir, "schools.json"), "utf-8")
    )
  }
  return _schools!
}

export function loadFaq(): FaqSchool[] {
  if (!_faq) {
    _faq = JSON.parse(
      fs.readFileSync(path.join(dataDir, "faq.json"), "utf-8")
    )
  }
  return _faq!
}

export function loadSearchIndex(): SearchIndex[] {
  if (!_searchIndex) {
    _searchIndex = JSON.parse(
      fs.readFileSync(path.join(dataDir, "search-index.json"), "utf-8")
    )
  }
  return _searchIndex!
}

export function getSchoolById(id: string): School | undefined {
  return loadSchools().find((s) => s.id === id)
}

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

export function getAllSchoolIds(): string[] {
  return loadSchools().map((s) => s.id)
}
