"use client"

import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react"
import { PROVINCES } from "@/lib/constants"
import type { SearchIndex, SchoolIndices } from "@/lib/types"
import { INDEX_META } from "@/lib/types"
import SchoolCard from "@/components/SchoolCard"

const SchoolCardMemo = memo(SchoolCard)

/** 表格中非指数列的个数（前 9 列） */
const STATIC_COL_COUNT = 9

/** 每次滚动加载的学校数量 */
const BATCH = 30

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
  ...INDEX_META.map((m) => ({
    key: m.key,
    label: m.label,
    getValue: (s: SearchIndex) => {
      const v = s.indices?.[m.key]
      return v !== undefined && v !== null ? v : null
    },
  })),
]

/**
 * 首页客户端组件
 * 功能：搜索、筛选、多列排序、无限滚动加载
 */
export default function HomeClient({ schools }: { schools: SearchIndex[] }) {
  const [query, setQuery] = useState("")
  const [province, setProvince] = useState("")
  const [level, setLevel] = useState("")
  const [tag, setTag] = useState("")
  const [count, setCount] = useState(BATCH)
  const [sorts, setSorts] = useState<{ key: string; dir: "asc" | "desc" }[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const watermarkRef = useRef<HTMLDivElement>(null)

  /** 根据查询条件和筛选器过滤学校列表 */
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

  /** 按排序规则对过滤后的结果进行排序 */
  const sorted = useMemo(() => {
    if (sorts.length === 0) return filtered
    let items = [...filtered]
    for (let i = sorts.length - 1; i >= 0; i--) {
      const { key, dir } = sorts[i]
      items.sort((a, b) => {
        const col = COLUMNS.find((c) => c.key === key)!
        const va = col.getValue(a)
        const vb = col.getValue(b)
        const aNil = va === null || va === "-"
        const bNil = vb === null || vb === "-"
        if (aNil && bNil) return 0
        if (aNil) return 1
        if (bNil) return -1
        if (typeof va === "number" && typeof vb === "number") {
          return dir === "asc" ? va - vb : vb - va
        }
        const cmp = String(va).localeCompare(String(vb))
        return dir === "asc" ? cmp : -cmp
      })
    }
    return items
  }, [filtered, sorts])

  const visible = sorted.slice(0, count)
  const hasMore = count < sorted.length

  /** 切换排序列：未排序 -> 升序 -> 降序 -> 取消排序 */
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

  /** 用于 IntersectionObserver 的哨兵元素引用，实现无限滚动 */
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    setCount((c) => Math.min(c + BATCH, sorted.length))
  }, [sorted.length])

  /** 使用 IntersectionObserver 实现滚动到底部自动加载更多 */
  useEffect(() => {
    const el = sentinelRef.current
    const root = wrapRef.current
    if (!el || !root) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      },
      { root, rootMargin: "200px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loadMore])

  useEffect(() => {
    setCount(BATCH)
  }, [query, province, level, tag])

  useEffect(() => {
    const el = wrapRef.current
    const wm = watermarkRef.current
    if (!el || !wm) return
    const handler = () => { wm.style.left = `${Math.max(0, 480 - el.scrollLeft)}px` }
    handler()
    el.addEventListener("scroll", handler)
    return () => el.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current!
    if (!wrap) return

    let isDown = false, moved = false, startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return
      isDown = true; moved = false
      startX = e.clientX; startY = e.clientY
      scrollLeft = wrap.scrollLeft; scrollTop = wrap.scrollTop
      wrap.classList.add("grabbing")
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDown) return
      e.preventDefault()
      const dx = e.clientX - startX, dy = e.clientY - startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        moved = true
        wrap.scrollLeft = scrollLeft - dx
        wrap.scrollTop = scrollTop - dy
      }
    }

    function onMouseUp() {
      if (!isDown) return
      isDown = false
      wrap.classList.remove("grabbing")
      if (moved) {
        const cancelClick = (ce: MouseEvent) => { ce.stopPropagation(); ce.preventDefault(); document.removeEventListener("click", cancelClick, true) }
        document.addEventListener("click", cancelClick, true)
      }
    }

    wrap.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      wrap.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <>
      <header className="header">
        <div className="container">
          <img src="/logoL.png" alt="高考志愿助手" height="32" />
          <nav>
            <a href="/">首页</a>
            <a href="/compare">对比</a>
          </nav>
        </div>
      </header>
      <main className="container">
          <div className="search-section">
            <div className="search-row">
              <input
                type="text"
                placeholder="搜索学校名称..."
                value={query}
                onChange={(e) => { setQuery(e.target.value) }}
              />
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
              <span className="result-count">
                共 {filtered.length} 所学校
                {filtered.length !== schools.length && `（已筛选）`}
              </span>
            </div>
          </div>

        <div className="table-wrap" ref={wrapRef}>
          <table className="school-table">
            <thead className="sticky-shadow">
              <tr>
                {COLUMNS.map((col, i) => {
                  const s = sorts.find((s) => s.key === col.key)
                  const pri = s ? sorts.indexOf(s) + 1 : 0
                  const isIdx = INDEX_META.some((m) => m.key === col.key)
                  return (
                    <th key={col.key} onClick={() => toggleSort(col.key)} className={"sortable" + (isIdx ? " idx-header" : "") + (i === 0 ? " first-col" : "")}>
                      <span>{col.label}</span>
                      <span className={"sort-indicator" + (s ? " " + s.dir : "")}>
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
                <SchoolCardMemo key={school.id} school={school} />
              ))}
            </tbody>
          </table>
          {hasMore && <div ref={sentinelRef} className="loading">加载更多...</div>}
        </div>

        <div className="idx-watermark" ref={watermarkRef} aria-hidden="true">
          此为基于问答分析的指数（不太准确）
          <br />
          请点击学校进入详情页查看详细问答
        </div>
      </main>
    </>
  )
}
