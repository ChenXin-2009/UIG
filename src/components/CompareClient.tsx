"use client"

import { useState, Fragment } from "react"
import { TAG_COLORS, PROVINCES, TYPE_LABELS } from "@/lib/constants"

interface CompactSchool {
  id: string; name: string; province_id: string; province_name: string
  level_name: string; nature_name: string; type_name: string; city_name: string
  f985: string; f211: string; dual_class_name: string
  ruanke_rank: string; xyh_rank: string; qs_world: string
  province_score_min?: Record<string, { province_id: string; type: string; min: string; year: string }>
}

interface SearchItem { id: string; name: string; short: string }

export default function CompareClient({
  searchIndex, schoolsCompact,
}: {
  searchIndex: SearchItem[]
  schoolsCompact: CompactSchool[]
}) {
  const [slots, setSlots] = useState<(CompactSchool | null)[]>([null, null])
  const [query, setQuery] = useState(["", ""])

  const filtered = (i: number) => {
    const q = query[i].toLowerCase()
    if (!q) return []
    return searchIndex
      .filter((s) => s.name.toLowerCase().includes(q) || s.short.toLowerCase().includes(q))
      .slice(0, 10)
  }

  const selectSchool = (i: number, id: string) => {
    const school = schoolsCompact.find((s) => s.id === id) || null
    setSlots((prev) => { const n = [...prev]; n[i] = school; return n })
    setQuery((q) => { const n = [...q]; n[i] = ""; return n })
  }

  const removeSchool = (i: number) => {
    setSlots((prev) => { const n = [...prev]; n[i] = null; return n })
  }

  const valid = slots.filter((s): s is CompactSchool => s !== null)

  const addSlot = () => {
    setSlots([...slots, null])
    setQuery([...query, ""])
  }

  const provinceScore = (s: CompactSchool, pid: string) => {
    const v = s.province_score_min?.[pid]
    if (!v) return "-"
    return `${v.min} (${TYPE_LABELS[v.type] || v.type}, ${v.year})`
  }

  const tagList = (s: CompactSchool) => {
    const t: string[] = []
    if (s.f985 === "1") t.push("985")
    if (s.f211 === "1") t.push("211")
    if (s.dual_class_name?.includes("双一流")) t.push("双一流")
    return t
  }

  const rows: { label: string; render: (s: CompactSchool) => string | React.ReactNode }[] = [
    { label: "省份", render: (s) => PROVINCES.find((p) => p.id === s.province_id)?.name || s.province_name },
    { label: "层次", render: (s) => s.level_name },
    { label: "性质", render: (s) => s.nature_name },
    { label: "类型", render: (s) => s.type_name },
    { label: "标签", render: (s) => tagList(s).map((t) => (
      <span key={t} className="tag" style={{ backgroundColor: TAG_COLORS[t] }}>{t}</span>
    )) },
    { label: "软科排名", render: (s) => s.ruanke_rank || "-" },
    { label: "校友会排名", render: (s) => s.xyh_rank || "-" },
    { label: "QS世界排名", render: (s) => s.qs_world || "-" },
    { label: "最低分(北京)", render: (s) => provinceScore(s, "11") },
    { label: "最低分(上海)", render: (s) => provinceScore(s, "31") },
    { label: "最低分(广东)", render: (s) => provinceScore(s, "44") },
  ]

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>高考志愿助手</h1>
          <nav><a href="/">首页</a><a href="/compare">对比</a></nav>
        </div>
      </header>
      <main className="container">
        <h1 style={{ marginBottom: 20, fontSize: 24 }}>学校对比</h1>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {slots.map((slot, i) => (
            <div key={i} style={{ flex: 1, minWidth: 200 }}>
              {slot ? (
                <div className="card" style={{ position: "relative" }}>
                  <strong>{slot.name}</strong>
                  <button onClick={() => removeSchool(i)}
                    style={{ position: "absolute", top: 8, right: 8, border: "none", background: "none", cursor: "pointer", color: "#e74c3c", fontSize: 18 }}>
                    ×
                  </button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <input type="text" placeholder={`学校 ${i + 1}...`} value={query[i]}
                    onChange={(e) => { const n = [...query]; n[i] = e.target.value; setQuery(n) }}
                    style={{ width: "100%", padding: "8px 12px", border: "2px solid #ddd", borderRadius: 6, fontSize: 14 }} />
                  {filtered(i).length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ddd", borderRadius: 6, zIndex: 10, maxHeight: 300, overflowY: "auto" }}>
                      {filtered(i).map((s) => (
                        <div key={s.id} onClick={() => selectSchool(i, s.id)}
                          style={{ padding: "8px 12px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid #f0f0f0" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {slots.length < 4 && (
            <button onClick={addSlot} style={{ padding: "8px 16px", border: "2px dashed #ddd", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, alignSelf: "flex-end" }}>
              + 添加学校
            </button>
          )}
        </div>

        {valid.length >= 2 && (
          <div className="card" style={{ overflowX: "auto" }}>
            <div className="compare-container">
              <div className="compare-label"></div>
              {valid.map((s) => <div key={s.id} className="compare-header">{s.name}</div>)}
              {rows.map((row) => (
                <Fragment key={row.label}>
                  <div className="compare-label">{row.label}</div>
                  {valid.map((s) => (
                    <div key={`${row.label}-${s.id}`} className="compare-value">{row.render(s)}</div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
