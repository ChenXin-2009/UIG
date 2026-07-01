import { TAG_COLORS } from "@/lib/constants"
import type { SearchIndex } from "@/lib/types"

const TAG_COLS = ["985", "211", "双一流"]

export default function SchoolCard({ school }: { school: SearchIndex }) {
  const has = (t: string) => school.tags.includes(t)
  return (
    <tr onClick={() => window.location.href = `/school/${school.id}`}>
      <td style={{ fontWeight: 600 }}>{school.name}</td>
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
    </tr>
  )
}
