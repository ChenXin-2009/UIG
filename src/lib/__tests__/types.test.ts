import { INDEX_META, SCHOOL_LEVELS, SCHOOL_TYPES, SCHOOL_NATURES } from "@/lib/types"

describe("types", () => {
  describe("INDEX_META", () => {
    it("should have exactly 20 indices", () => {
      expect(INDEX_META.length).toBe(20)
    })

    it("each index should have required fields", () => {
      for (const meta of INDEX_META) {
        expect(meta).toHaveProperty("key")
        expect(meta).toHaveProperty("label")
        expect(meta).toHaveProperty("unit")
        expect(meta).toHaveProperty("type")
        expect(["score", "numeric"]).toContain(meta.type)
      }
    })

    it("should have unique keys", () => {
      const keys = INDEX_META.map((m) => m.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it("should include common indices", () => {
      const labels = INDEX_META.map((m) => m.label)
      expect(labels).toContain("空调")
      expect(labels).toContain("食堂")
      expect(labels).toContain("热水")
    })
  })

  describe("SCHOOL_LEVELS", () => {
    it("should have 3 levels", () => {
      expect(Object.keys(SCHOOL_LEVELS).length).toBe(3)
    })

    it("should map correctly", () => {
      expect(SCHOOL_LEVELS["2001"]).toBe("本科")
      expect(SCHOOL_LEVELS["2002"]).toBe("专科（高职）")
    })
  })

  describe("SCHOOL_TYPES", () => {
    it("should have 13 types", () => {
      expect(Object.keys(SCHOOL_TYPES).length).toBe(13)
    })

    it("should include major types", () => {
      expect(SCHOOL_TYPES["5001"]).toBe("理工类")
      expect(SCHOOL_TYPES["5008"]).toBe("师范类")
    })
  })

  describe("SCHOOL_NATURES", () => {
    it("should have 4 natures", () => {
      expect(Object.keys(SCHOOL_NATURES).length).toBe(4)
    })

    it("should include public and private", () => {
      expect(SCHOOL_NATURES["36000"]).toBe("公办")
      expect(SCHOOL_NATURES["36001"]).toBe("民办")
    })
  })
})
