import { render, screen } from "@testing-library/react"
import NotFound from "@/app/school/[id]/not-found"

describe("NotFound (404 page)", () => {
  it("should show 404 message", () => {
    render(<NotFound />)
    expect(screen.getByText("404 - 学校未找到")).toBeInTheDocument()
  })

  it("should show explanation text", () => {
    render(<NotFound />)
    expect(screen.getByText("抱歉，未找到该学校的信息。")).toBeInTheDocument()
  })

  it("should have a link back to home", () => {
    render(<NotFound />)
    const link = screen.getByText("返回首页")
    expect(link).toHaveAttribute("href", "/")
  })
})
