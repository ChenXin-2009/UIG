import { render, screen, fireEvent } from "@testing-library/react"
import CompareClient from "@/components/CompareClient"

const mockSearchIndex = [
  { id: "1001", name: "清华大学", short: "清华" },
  { id: "1002", name: "北京大学", short: "北大" },
  { id: "1003", name: "复旦大学", short: "复旦" },
]

const mockSchoolsCompact = [
  { id: "1001", name: "清华大学", province_id: "11", province_name: "北京", level_name: "本科", nature_name: "公办", type_name: "综合类", city_name: "北京", f985: "1", f211: "1", dual_class_name: "双一流", ruanke_rank: "1", xyh_rank: "", qs_world: "" },
  { id: "1002", name: "北京大学", province_id: "11", province_name: "北京", level_name: "本科", nature_name: "公办", type_name: "综合类", city_name: "北京", f985: "1", f211: "1", dual_class_name: "双一流", ruanke_rank: "2", xyh_rank: "", qs_world: "" },
  { id: "1003", name: "复旦大学", province_id: "31", province_name: "上海", level_name: "本科", nature_name: "公办", type_name: "综合类", city_name: "上海", f985: "1", f211: "1", dual_class_name: "双一流", ruanke_rank: "", xyh_rank: "", qs_world: "" },
]

it("should render search inputs", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  expect(screen.getByPlaceholderText("学校 1...")).toBeInTheDocument()
  expect(screen.getByPlaceholderText("学校 2...")).toBeInTheDocument()
})

it("should show filtered schools on input", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input, { target: { value: "清华" } })
  expect(screen.getByText("清华大学")).toBeInTheDocument()
})

it("should select a school on click", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input, { target: { value: "清华" } })
  fireEvent.click(screen.getByText("清华大学"))
  expect(screen.getByText("清华大学")).toBeInTheDocument()
  expect(screen.queryByPlaceholderText("学校 1...")).not.toBeInTheDocument()
})

it("should remove a school", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input, { target: { value: "清华" } })
  fireEvent.click(screen.getByText("清华大学"))
  const removeBtn = screen.getByText("×")
  fireEvent.click(removeBtn)
  expect(screen.getByPlaceholderText("学校 1...")).toBeInTheDocument()
})

it("should show add button when less than 4 slots", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  expect(screen.getByText("+ 添加学校")).toBeInTheDocument()
})

it("should show comparison table when 2 schools selected", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input1 = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input1, { target: { value: "清华" } })
  fireEvent.click(screen.getByText("清华大学"))
  const input2 = screen.getByPlaceholderText("学校 2...")
  fireEvent.change(input2, { target: { value: "北大" } })
  fireEvent.click(screen.getByText("北京大学"))
  expect(screen.getByText("省份")).toBeInTheDocument()
  expect(screen.getByText("层次")).toBeInTheDocument()
})

it("should show tags for 985/211 schools", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input1 = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input1, { target: { value: "清华" } })
  fireEvent.click(screen.getByText("清华大学"))
  const input2 = screen.getByPlaceholderText("学校 2...")
  fireEvent.change(input2, { target: { value: "北大" } })
  fireEvent.click(screen.getByText("北京大学"))
  const tags = screen.getAllByText("985")
  expect(tags.length).toBeGreaterThan(0)
})

it("should add more slots with add button", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  fireEvent.click(screen.getByText("+ 添加学校"))
  expect(screen.getByPlaceholderText("学校 3...")).toBeInTheDocument()
})

it("should search by short name", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input, { target: { value: "北大" } })
  expect(screen.getByText("北京大学")).toBeInTheDocument()
})

it("should show province name in comparison table", () => {
  render(<CompareClient searchIndex={mockSearchIndex} schoolsCompact={mockSchoolsCompact} />)
  const input1 = screen.getByPlaceholderText("学校 1...")
  fireEvent.change(input1, { target: { value: "清华" } })
  fireEvent.click(screen.getByText("清华大学"))
  const input2 = screen.getByPlaceholderText("学校 2...")
  fireEvent.change(input2, { target: { value: "复旦" } })
  fireEvent.click(screen.getByText("复旦大学"))
  expect(screen.getByText("北京")).toBeInTheDocument()
  expect(screen.getByText("上海")).toBeInTheDocument()
})
