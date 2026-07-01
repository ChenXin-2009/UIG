"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { PROVINCES } from "@/lib/constants"
import type { SearchIndex } from "@/lib/types"
import SchoolCard from "@/components/SchoolCard"

const BATCH = 50

const COLUMNS = [
  { key: "name", label: "学校名称", getValue: (s: SearchIndex) => s.name },
  { key: "province", label: "所在地", getValue: (s: SearchIndex) => s.province },
  { key: "level", label: "层次", getValue: (s: SearchIndex) => s.level },
  { key: "ruanke", label: "软科", getValue: (s: SearchIndex) => s.ruanke && s.ruanke !== "0" ? Number(s.ruanke) : null },
  { key: "min_score", label: "最低分", getValue: (s: SearchIndex) => Number(s.min_score) || null },
  { key: "985", label: "985", getValue: (s: SearchIndex) => s.tags.includes("985") ? 1 : 0 },
  { key: "211", label: "211", getValue: (s: SearchIndex) => s.tags.includes("211") ? 1 : 0 },
  { key: "双一流", label: "双一流", getValue: (s: SearchIndex) => s.tags.includes("双一流") ? 1 : 0 },
  { key: "type", label: "类型", getValue: (s: SearchIndex) => s.tags.includes("公办") ? "公办" : s.tags.includes("民办") ? "民办" : "-" },
]

function compare(a: SearchIndex, b: SearchIndex, key: string): number {
  const col = COLUMNS.find((c) => c.key === key)!
  const va = col.getValue(a)
  const vb = col.getValue(b)
  if (va === null && vb === null) return 0
  if (va === null) return 1
  if (vb === null) return -1
  if (typeof va === "number" && typeof vb === "number") return va - vb
  return String(va).localeCompare(String(vb))
}

export default function HomeClient({ schools }: { schools: SearchIndex[] }) {
  const [query, setQuery] = useState("")
  const [province, setProvince] = useState("")
  const [level, setLevel] = useState("")
  const [tag, setTag] = useState("")
  const [count, setCount] = useState(BATCH)
  const [sorts, setSorts] = useState<{ key: string; dir: "asc" | "desc" }[]>([])

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

  const sorted = useMemo(() => {
    if (sorts.length === 0) return filtered
    let items = [...filtered]
    for (let i = sorts.length - 1; i >= 0; i--) {
      const { key, dir } = sorts[i]
      items.sort((a, b) => {
        const cmp = compare(a, b, key)
        return dir === "asc" ? cmp : -cmp
      })
    }
    return items
  }, [filtered, sorts])

  const visible = sorted.slice(0, count)
  const hasMore = count < sorted.length

  function toggleSort(key: string) {
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.key === key)
      if (idx === -1) return [...prev, { key, dir: "asc" as const }]
      if (prev[idx].dir === "asc") {
        const next = [...prev]
        next[idx] = { key, dir: "desc" }
        return next
      }
      return prev.filter((s) => s.key !== key)
    })
  }

  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    setCount((c) => Math.min(c + BATCH, sorted.length))
  }, [sorted.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      },
      { rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loadMore])

  useEffect(() => {
    setCount(BATCH)
  }, [query, province, level, tag])

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
              onChange={(e) => { setQuery(e.target.value) }}
            />
          </div>
          <div className="filters">
            <select value={province} onChange={(e) => { setProvince(e.target.value) }}>
              <option value="">全部省份</option>
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <select value={level} onChange={(e) => { setLevel(e.target.value) }}>
              <option value="">全部层次</option>
              <option value="本科">本科</option>
              <option value="专科（高职）">专科（高职）</option>
            </select>
            <select value={tag} onChange={(e) => { setTag(e.target.value) }}>
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

        <div className="table-wrap">
          <table className="school-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const s = sorts.find((s) => s.key === col.key)
                  const pri = s ? sorts.indexOf(s) + 1 : 0
                  return (
                    <th key={col.key} onClick={() => toggleSort(col.key)} className="sortable">
                      <span>{col.label}</span>
                      <span className="sort-indicator">
                        {s ? (s.dir === "asc" ? "▲" : "▼") : ""}
                        {pri > 1 && <sup>{pri}</sup>}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && <div ref={sentinelRef} className="loading">加载更多...</div>}
      </main>
    </>
  )
}
