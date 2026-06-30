"use client"

import { useState, useMemo } from "react"
import { PROVINCES } from "@/lib/constants"
import type { SearchIndex } from "@/lib/types"
import SchoolCard from "@/components/SchoolCard"

const PAGE_SIZE = 24

export default function HomeClient({ schools }: { schools: SearchIndex[] }) {
  const [query, setQuery] = useState("")
  const [province, setProvince] = useState("")
  const [level, setLevel] = useState("")
  const [tag, setTag] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let items = schools
    if (query) {
      const q = query.toLowerCase()
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.short.toLowerCase().includes(q)
      )
    }
    if (province) items = items.filter((s) => s.province === province)
    if (level) items = items.filter((s) => s.level === level)
    if (tag) items = items.filter((s) => s.tags.includes(tag))
    return items
  }, [query, province, level, tag, schools])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const current = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>高考志愿助手</h1>
          <nav>
            <a href="/">首页</a>
            <a href="/compare">对比</a>
          </nav>
        </div>
      </header>
      <main className="container">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="搜索学校名称..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0) }}
            />
          </div>
          <div className="filters">
            <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(0) }}>
              <option value="">全部省份</option>
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(0) }}>
              <option value="">全部层次</option>
              <option value="本科">本科</option>
              <option value="专科（高职）">专科（高职）</option>
            </select>
            <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(0) }}>
              <option value="">全部标签</option>
              <option value="985">985</option>
              <option value="211">211</option>
              <option value="双一流">双一流</option>
              <option value="公办">公办</option>
              <option value="民办">民办</option>
            </select>
          </div>
          <div className="result-count">
            共 {filtered.length} 所学校
            {filtered.length !== schools.length && `（已筛选）`}
          </div>
        </div>

        <div className="card-grid">
          {current.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <button
                key={i}
                className={page === i ? "active" : ""}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              下一页
            </button>
          </div>
        )}
      </main>
    </>
  )
}
