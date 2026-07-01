import { render, screen, fireEvent } from "@testing-library/react"
import SchoolCard from "@/components/SchoolCard"
import type { SearchIndex } from "@/lib/types"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSchool: SearchIndex = {
  id: "1001",
  name: "清华大学",
  short: "清华",
  province: "北京",
  level: "本科",
  tags: ["985", "211", "双一流", "公办"],
  ruanke: "1",
  min_score: "680",
  indices: {
    air_con: 90,
    bed_type: 85,
    bathroom: 80,
    canteen: 75,
    internet: 70,
  },
}

function renderInTable(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>)
}

describe("SchoolCard", () => {
  it("should render school name", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("清华大学")).toBeInTheDocument()
  })

  it("should render province", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("北京")).toBeInTheDocument()
  })

  it("should render tags for 985/211/双一流", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("985")).toBeInTheDocument()
    expect(screen.getByText("211")).toBeInTheDocument()
    expect(screen.getByText("双一流")).toBeInTheDocument()
  })

  it("should render rank", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("should render min score", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("680")).toBeInTheDocument()
  })

  it("should show dash for missing rank", () => {
    const noRank: SearchIndex = {
      ...mockSchool,
      ruanke: "0",
    }
    renderInTable(<SchoolCard school={noRank} />)
    const dashes = screen.getAllByText("-")
    expect(dashes.length).toBeGreaterThan(0)
  })

  it("should show indices with color coding", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("90")).toBeInTheDocument()
    expect(screen.getByText("85")).toBeInTheDocument()
  })

  it("tr element should have onClick that navigates to school page", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    const row = screen.getByText("清华大学").closest("tr")!
    expect(row.onclick).toBeTruthy()
  })

  it("should show dash for missing min_score", () => {
    const noScore: SearchIndex = { ...mockSchool, min_score: "" }
    renderInTable(<SchoolCard school={noScore} />)
    const dashes = screen.getAllByText("-")
    expect(dashes.length).toBeGreaterThan(0)
  })

  it("should render public/private tag", () => {
    renderInTable(<SchoolCard school={mockSchool} />)
    expect(screen.getByText("公办")).toBeInTheDocument()
  })

  it("should show dash for missing index values", () => {
    const noIndices: SearchIndex = { ...mockSchool, indices: undefined }
    renderInTable(<SchoolCard school={noIndices} />)
    const dashes = screen.getAllByText("-")
    expect(dashes.length).toBeGreaterThan(0)
  })

  it("should show numeric index with range display", () => {
    const withRanges: SearchIndex = {
      ...mockSchool,
      indices: { running_km: 3 },
      ranges: { running_km: { min: 1, max: 5 } },
    }
    renderInTable(<SchoolCard school={withRanges} />)
    expect(screen.getByText("1-5km")).toBeInTheDocument()
  })

  it("should show score index with green color for 80+", () => {
    const highScore: SearchIndex = {
      ...mockSchool,
      indices: { air_con: 95 },
    }
    renderInTable(<SchoolCard school={highScore} />)
    const el = screen.getByText("95")
    expect(el).toBeInTheDocument()
    expect(el.style.color).toBe("rgb(39, 174, 96)")
  })

  it("should show score index with red color for under 20", () => {
    const lowScore: SearchIndex = {
      ...mockSchool,
      indices: { air_con: 15 },
    }
    renderInTable(<SchoolCard school={lowScore} />)
    const el = screen.getByText("15")
    expect(el).toBeInTheDocument()
    expect(el.style.color).toBe("rgb(231, 76, 60)")
  })

  it("should not show tags that school does not have", () => {
    const noTags: SearchIndex = { ...mockSchool, tags: [] }
    renderInTable(<SchoolCard school={noTags} />)
    const dashes = screen.getAllByText("-")
    expect(dashes.length).toBeGreaterThan(0)
  })

  it("should remove logo image on error", () => {
    const { container } = renderInTable(<SchoolCard school={mockSchool} />)
    const img = container.querySelector("img")!
    expect(img).toBeInTheDocument()
    fireEvent.error(img)
    expect(container.querySelector("img")).toBeNull()
  })

  it("should show dash for no tags and no indices", () => {
    const sparse: SearchIndex = { id: "9999", name: "测试", short: "测试", province: "北京", level: "本科", tags: [], ruanke: "0", min_score: "" }
    renderInTable(<SchoolCard school={sparse} />)
    expect(screen.getByText("测试")).toBeInTheDocument()
  })
})
