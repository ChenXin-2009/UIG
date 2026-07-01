/**
 * @jest-environment node
 */

import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

describe("data files", () => {
  const requiredFiles = [
    "schools.json",
    "faq.json",
    "search-index.json",
    "school_indices.json",
  ]

  for (const file of requiredFiles) {
    it(`${file} should exist and be valid JSON`, () => {
      const fp = path.join(DATA_DIR, file)
      expect(fs.existsSync(fp)).toBe(true)
      const content = fs.readFileSync(fp, "utf-8")
      expect(() => JSON.parse(content)).not.toThrow()
    })
  }

  describe("schools.json", () => {
    it("should contain at least 2000 schools", () => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "schools.json"), "utf-8"))
      expect(data.length).toBeGreaterThanOrEqual(2000)
    })

    it("each school should have required fields", () => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "schools.json"), "utf-8"))
      for (const school of data) {
        expect(school).toHaveProperty("id")
        expect(school).toHaveProperty("name")
        expect(school).toHaveProperty("province_id")
      }
    })
  })

  describe("search-index.json", () => {
    it("should have the same length as schools", () => {
      const schools = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "schools.json"), "utf-8"))
      const idx = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "search-index.json"), "utf-8"))
      expect(idx.length).toBe(schools.length)
    })
  })

  describe("school_indices.json", () => {
    it("should have at least 3000 schools", () => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "school_indices.json"), "utf-8"))
      expect(Object.keys(data).length).toBeGreaterThanOrEqual(3000)
    })
  })
})

describe("data functions", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it("loadSchools should return array of schools", () => {
    const { loadSchools } = require("../data")
    const schools = loadSchools()
    expect(Array.isArray(schools)).toBe(true)
    expect(schools.length).toBeGreaterThan(0)
    expect(schools[0]).toHaveProperty("id")
    expect(schools[0]).toHaveProperty("name")
  })

  it("getSchoolById should find a school", () => {
    const { getSchoolById } = require("../data")
    const school = getSchoolById("1001")
    expect(school).toBeDefined()
    expect(school!.id).toBe("1001")
  })

  it("getSchoolById should return undefined for non-existent ID", () => {
    const { getSchoolById } = require("../data")
    expect(getSchoolById("nonexistent")).toBeUndefined()
  })

  it("getAllSchoolIds should return all IDs", () => {
    const { getAllSchoolIds } = require("../data")
    const ids = getAllSchoolIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBeGreaterThan(2000)
    expect(ids).toContain("1001")
  })

  it("loadFaq should return array of FAQ schools", () => {
    const { loadFaq } = require("../data")
    const faq = loadFaq()
    expect(Array.isArray(faq)).toBe(true)
    expect(faq.length).toBeGreaterThan(0)
  })

  it("loadSearchIndex should return array", () => {
    const { loadSearchIndex } = require("../data")
    const idx = loadSearchIndex()
    expect(Array.isArray(idx)).toBe(true)
    expect(idx.length).toBeGreaterThan(0)
  })

  it("loadSearchIndexWithIndices should attach indices", () => {
    const { loadSearchIndexWithIndices } = require("../data")
    const items = loadSearchIndexWithIndices()
    expect(items.length).toBeGreaterThan(0)
    const hasIndices = items.some((s: any) => s.indices)
    expect(hasIndices).toBe(true)
  })

  it("getFaqBySchoolName should return FAQ for valid school name", () => {
    const { getFaqBySchoolName } = require("../data")
    const faq = getFaqBySchoolName("清华大学")
    expect(faq).toBeDefined()
    expect(faq!.name).toBe("清华大学")
  })

  it("getFaqBySchoolName should return undefined for unknown school", () => {
    const { getFaqBySchoolName } = require("../data")
    expect(getFaqBySchoolName("不存在的大学")).toBeUndefined()
  })

  it("loadSchoolIndices should return indices object", () => {
    const { loadSchoolIndices } = require("../data")
    const indices = loadSchoolIndices()
    expect(indices).toBeDefined()
    expect(typeof indices).toBe("object")
    expect(Object.keys(indices).length).toBeGreaterThan(0)
  })
})
