import { render, screen, fireEvent } from "@testing-library/react"
import HomeClient from "@/components/HomeClient"
import type { SearchIndex } from "@/lib/types"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock("@/components/SchoolCard", () => {
  return function MockSchoolCard({ school }: { school: SearchIndex }) {
    return <tr data-testid="school-row"><td>{school.name}</td></tr>
  }
})

const mockSchools: SearchIndex[] = [
  { id: "1001", name: "清华大学", short: "清华", province: "北京", level: "本科", tags: ["985", "211", "双一流", "公办"], ruanke: "1", min_score: "680" },
  { id: "1002", name: "北京大学", short: "北大", province: "北京", level: "本科", tags: ["985", "211", "双一流", "公办"], ruanke: "2", min_score: "678" },
  { id: "1003", name: "复旦大学", short: "复旦", province: "上海", level: "本科", tags: ["985", "211", "双一流", "公办"], ruanke: "5", min_score: "650" },
  { id: "2001", name: "上海大学", short: "上大", province: "上海", level: "本科", tags: ["211", "双一流", "公办"], ruanke: "50", min_score: "580" },
  { id: "3001", name: "北京专科学校", short: "北专", province: "北京", level: "专科（高职）", tags: ["公办"], ruanke: "0", min_score: "" },
]

beforeEach(() => {
  jest.clearAllMocks()
})

it("should render all schools initially", () => {
  render(<HomeClient schools={mockSchools} />)
  expect(screen.getByText("清华大学")).toBeInTheDocument()
  expect(screen.getByText("北京大学")).toBeInTheDocument()
  expect(screen.getByText("复旦大学")).toBeInTheDocument()
})

it("should show result count", () => {
  render(<HomeClient schools={mockSchools} />)
  expect(screen.getByText(/共 5 所学校/)).toBeInTheDocument()
})

it("should filter schools by search query", () => {
  render(<HomeClient schools={mockSchools} />)
  const input = screen.getByPlaceholderText("搜索学校名称...")
  fireEvent.change(input, { target: { value: "清华" } })
  expect(screen.getByText("清华大学")).toBeInTheDocument()
  expect(screen.queryByText("复旦大学")).not.toBeInTheDocument()
})

it("should filter by short name", () => {
  render(<HomeClient schools={mockSchools} />)
  const input = screen.getByPlaceholderText("搜索学校名称...")
  fireEvent.change(input, { target: { value: "北大" } })
  expect(screen.getByText("北京大学")).toBeInTheDocument()
})

it("should filter schools by province", () => {
  render(<HomeClient schools={mockSchools} />)
  const selects = screen.getAllByRole("combobox")
  const provinceSelect = selects[0]
  fireEvent.change(provinceSelect, { target: { value: "上海" } })
  expect(screen.getByText("复旦大学")).toBeInTheDocument()
  expect(screen.queryByText("清华大学")).not.toBeInTheDocument()
})

it("should filter schools by level", () => {
  render(<HomeClient schools={mockSchools} />)
  const selects = screen.getAllByRole("combobox")
  const levelSelect = selects[1]
  fireEvent.change(levelSelect, { target: { value: "专科（高职）" } })
  expect(screen.getByText("北京专科学校")).toBeInTheDocument()
  expect(screen.queryByText("清华大学")).not.toBeInTheDocument()
})

it("should filter schools by tag", () => {
  render(<HomeClient schools={mockSchools} />)
  const selects = screen.getAllByRole("combobox")
  const tagSelect = selects[2]
  fireEvent.change(tagSelect, { target: { value: "985" } })
  expect(screen.getByText("清华大学")).toBeInTheDocument()
  expect(screen.queryByText("上海大学")).not.toBeInTheDocument()
})

it("should show filtered count when filtering", () => {
  render(<HomeClient schools={mockSchools} />)
  const input = screen.getByPlaceholderText("搜索学校名称...")
  fireEvent.change(input, { target: { value: "清华" } })
  expect(screen.getByText(/已筛选/)).toBeInTheDocument()
})

it("should reset count on filter change", () => {
  render(<HomeClient schools={mockSchools} />)
  const input = screen.getByPlaceholderText("搜索学校名称...")
  fireEvent.change(input, { target: { value: "清华" } })
  expect(screen.getByText("清华大学")).toBeInTheDocument()
  fireEvent.change(input, { target: { value: "" } })
  expect(screen.getAllByText("清华大学").length).toBeGreaterThan(0)
  expect(screen.getByText("北京大学")).toBeInTheDocument()
})

it("should click column header to sort", () => {
  render(<HomeClient schools={mockSchools} />)
  const headers = screen.getAllByRole("columnheader")
  const nameHeader = headers.find((h) => h.textContent?.includes("学校名称"))!
  fireEvent.click(nameHeader)
  const indicators = document.querySelectorAll(".sort-indicator")
  expect(indicators.length).toBeGreaterThan(0)
})

it("should click column header to cycle sort directions", () => {
  render(<HomeClient schools={mockSchools} />)
  const headers = screen.getAllByRole("columnheader")
  const nameHeader = headers.find((h) => h.textContent?.includes("学校名称"))!
  fireEvent.click(nameHeader)
  fireEvent.click(nameHeader)
  fireEvent.click(nameHeader)
  const indicators = document.querySelectorAll(".sort-indicator")
  const activeIndicators = Array.from(indicators).filter((i) => i.textContent?.trim())
  expect(activeIndicators.length).toBe(0)
})
