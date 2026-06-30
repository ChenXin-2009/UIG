import { TAG_COLORS } from "@/lib/constants"
import type { SearchIndex } from "@/lib/types"

export default function SchoolCard({ school }: { school: SearchIndex }) {
  return (
    <a href={`/school/${school.id}`} className="card school-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <h3>{school.name}</h3>
        {school.min_score && (
          <div style={{ textAlign: "right", fontSize: 13, color: "#666", whiteSpace: "nowrap", marginLeft: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a73e8" }}>{school.min_score}</div>
            <div style={{ fontSize: 11 }}>{school.province}最低</div>
          </div>
        )}
      </div>
      <div className="meta">
        <span>{school.province}</span>
        <span>{school.level}</span>
        {school.ruanke && <span>软科: {school.ruanke}</span>}
      </div>
      <div>
        {school.tags.map((t) => (
          <span key={t} className="tag" style={{ backgroundColor: TAG_COLORS[t] || "#95a5a6" }}>{t}</span>
        ))}
      </div>
    </a>
  )
}
