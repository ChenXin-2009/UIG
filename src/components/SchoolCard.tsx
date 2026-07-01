"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TAG_COLORS } from "@/lib/constants"
import type { SearchIndex } from "@/lib/types"
import { INDEX_META } from "@/lib/types"

const TAG_COLS = ["985", "211", "双一流"]

export default function SchoolCard({ school, style }: { school: SearchIndex; style?: React.CSSProperties }) {
  const router = useRouter()
  const has = (t: string) => school.tags.includes(t)
  // 先尝试 CDN logo，失败后回退到本地 /logos/ 目录
  const cdnUrl = `https://static-data.gaokao.cn/upload/logo/${school.id}.jpg`
  const [logoFailed, setLogoFailed] = useState(false)
  return (
    <tr onClick={() => router.push(`/school/${school.id}`)} style={style}>
      <td className="name-cell first-col" style={{
        fontWeight: 800,
        fontSize: "1.1em",
        background: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(${logoFailed ? `/logos/${school.id}.jpg` : cdnUrl}) center center / 50% auto no-repeat`,
      }}>
        {!logoFailed && <img src={cdnUrl} onError={() => setLogoFailed(true)} style={{ display: "none" }} />}
        {school.name}
      </td>
      <td>{school.province}</td>
      <td>{school.level}</td>
      <td>{school.ruanke && school.ruanke !== "0" ? school.ruanke : '-'}</td>
      <td style={{ color: "#1a73e8", fontWeight: 700 }}>{school.min_score || '-'}</td>
      {TAG_COLS.map((t) => (
        <td key={t} style={has(t) ? { color: TAG_COLORS[t], fontWeight: 600 } : { color: "#ccc" }}>
          {has(t) ? t : "-"}
        </td>
      ))}
      <td style={has("公办") || has("民办") ? { color: has("公办") ? TAG_COLORS["公办"] : TAG_COLORS["民办"], fontWeight: 600 } : { color: "#ccc" }}>
        {has("公办") ? "公办" : has("民办") ? "民办" : "-"}
      </td>
      {INDEX_META.map((m) => {
        const v = school.indices?.[m.key]
        const r = school.ranges?.[m.key]
        if (v === null || v === undefined) {
          return <td key={m.key} className="idx-cell" style={{ color: "#ccc" }}>-</td>
        }
        if (m.type === "numeric") {
          const display = r && r.min !== r.max ? `${r.min}-${r.max}${m.unit}` : `${v}${m.unit}`
          return <td key={m.key} className="idx-cell" style={{ color: "#555" }}>{display}</td>
        }
        const c = v >= 80 ? "#27ae60" : v >= 60 ? "#2980b9" : v >= 40 ? "#f39c12" : v >= 20 ? "#e67e22" : "#e74c3c"
        return (
          <td key={m.key} className="idx-cell" style={{ color: c, fontWeight: 600 }}>
            {v}
          </td>
        )
      })}
    </tr>
  )
}
