"use client"

import { useState } from "react"
import type { FaqSchool } from "@/lib/types"

export default function FaqSection({ faq }: { faq: FaqSchool }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faq.answers || faq.answers.length === 0) {
    return <p className="loading">暂无校园问答数据</p>
  }

  return (
    <div>
      {faq.answers.map((item, i) => (
        <div key={i} className="faq-item">
          <div
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span>{item.question}</span>
            <span>{openIndex === i ? "▲" : "▼"}</span>
          </div>
          {openIndex === i && (
            <div className="faq-answers">
              {item.answers.map((a, j) => (
                <div key={j} className="faq-answer">
                  <div className="answer-text">{a.answer}</div>
                  <div className="answer-meta">
                    {a.year > 0 ? `${a.year}年` : ""} · {a.user}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
