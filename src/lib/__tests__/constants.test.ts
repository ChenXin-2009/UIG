import { PROVINCES, PROVINCE_MAP, TYPE_LABELS, TAG_COLORS } from "@/lib/constants"

describe("constants", () => {
  describe("PROVINCES", () => {
    it("should have 31 provinces/municipalities", () => {
      expect(PROVINCES.length).toBe(31)
    })

    it("each province should have id and name", () => {
      for (const p of PROVINCES) {
        expect(p).toHaveProperty("id")
        expect(p).toHaveProperty("name")
        expect(typeof p.id).toBe("string")
        expect(typeof p.name).toBe("string")
      }
    })

    it("should include Beijing and Shanghai", () => {
      const names = PROVINCES.map((p) => p.name)
      expect(names).toContain("北京")
      expect(names).toContain("上海")
      expect(names).toContain("广东")
    })
  })

  describe("PROVINCE_MAP", () => {
    it("should map IDs to names correctly", () => {
      expect(PROVINCE_MAP["11"]).toBe("北京")
      expect(PROVINCE_MAP["31"]).toBe("上海")
      expect(PROVINCE_MAP["44"]).toBe("广东")
    })

    it("should have the same length as PROVINCES", () => {
      expect(Object.keys(PROVINCE_MAP).length).toBe(PROVINCES.length)
    })
  })

  describe("TYPE_LABELS", () => {
    it("should include main exam types", () => {
      expect(TYPE_LABELS["1"]).toBe("理科")
      expect(TYPE_LABELS["2"]).toBe("文科")
      expect(TYPE_LABELS["3"]).toBe("综合")
      expect(TYPE_LABELS["2073"]).toBe("物理类")
      expect(TYPE_LABELS["2074"]).toBe("历史类")
    })
  })

  describe("TAG_COLORS", () => {
    it("should have all required tags", () => {
      const required = ["985", "211", "双一流", "公办", "民办", "本科", "专科"]
      for (const tag of required) {
        expect(TAG_COLORS).toHaveProperty(tag)
      }
    })

    it("colors should be valid hex values", () => {
      for (const color of Object.values(TAG_COLORS)) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/)
      }
    })
  })
})
