import { render, screen, fireEvent } from "@testing-library/react"
import FaqSection from "@/components/FaqSection"
import type { FaqSchool } from "@/lib/types"

const mockFaq: FaqSchool = {
  id: "test-university",
  name: "测试大学",
  answers: [
    {
      question: "宿舍是上床下桌吗",
      question_short: "上床下桌",
      answers: [
        { user: "A001", year: 2024, answer: "是" },
        { user: "A002", year: 2023, answer: "否" },
      ],
    },
    {
      question: "教室和宿舍有没有空调",
      question_short: "空调",
      answers: [
        { user: "A003", year: 2024, answer: "有" },
      ],
    },
  ],
}

describe("FaqSection", () => {
  it("should render FAQ questions", () => {
    render(<FaqSection faq={mockFaq} />)
    expect(screen.getByText("宿舍是上床下桌吗")).toBeInTheDocument()
    expect(screen.getByText("教室和宿舍有没有空调")).toBeInTheDocument()
  })

  it("should toggle answers on click", () => {
    render(<FaqSection faq={mockFaq} />)
    const question = screen.getByText("宿舍是上床下桌吗")
    expect(screen.queryByText("是")).not.toBeInTheDocument()
    fireEvent.click(question)
    expect(screen.getByText("是")).toBeInTheDocument()
    expect(screen.getByText("否")).toBeInTheDocument()
    fireEvent.click(question)
    expect(screen.queryByText("是")).not.toBeInTheDocument()
  })

  it("should show '暂无校园问答数据' for empty answers", () => {
    const emptyFaq: FaqSchool = { id: "empty", name: "空学校", answers: [] }
    render(<FaqSection faq={emptyFaq} />)
    expect(screen.getByText("暂无校园问答数据")).toBeInTheDocument()
  })

  it("should display answer metadata", () => {
    render(<FaqSection faq={mockFaq} />)
    fireEvent.click(screen.getByText("宿舍是上床下桌吗"))
    expect(screen.getByText("2024年 · A001")).toBeInTheDocument()
  })
})
