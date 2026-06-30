"use client"

import { useState, useEffect, useCallback } from "react"
import { PROVINCES, TYPE_LABELS } from "@/lib/constants"
import type { School } from "@/lib/types"

interface ScoreItem {
  sp_name: string
  min: string
  max: string
  average: string
  min_section: string
  local_batch_name: string
}

export default function ScoreChart({ school }: { school: School }) {
  const initProvince = school.province_id && school.province_score_min?.[school.province_id]
    ? school.province_id : "11"

  const [province, setProvince] = useState(initProvince)
  const [year, setYear] = useState("2025")
  const [typeId, setTypeId] = useState("")
  const [items, setItems] = useState<ScoreItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const allTypes = school.pro_type?.[province] || []
  const overview = school.province_score_min?.[province]

  const fetchScores = useCallback(async (pid: string, yr: string, tid: string) => {
    if (!pid || !yr || !tid) return
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ school_id: school.id, province_id: pid, year: yr, type_id: tid })
      const resp = await fetch(`/api/scores?${params}`)
      if (!resp.ok) {
        const data = await resp.json()
        setError(data.error || "查询失败")
        setItems([]); return
      }
      const data = await resp.json()
      setItems(data.items || [])
    } catch {
      setError("网络错误")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [school.id])

  useEffect(() => {
    if (allTypes.length > 0) {
      const firstType = allTypes[0]
      setTypeId(firstType)
      fetchScores(province, year, firstType)
    }
  }, [province, year])

  const onProvinceChange = (pid: string) => {
    setProvince(pid)
  }

  const onYearChange = (yr: string) => {
    setYear(yr)
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>省份</div>
          <select value={province} onChange={(e) => onProvinceChange(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, background: "#fff" }}>
            {PROVINCES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>年份</div>
          <select value={year} onChange={(e) => onYearChange(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, background: "#fff" }}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        {allTypes.length > 1 && (
          <div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>科类</div>
            <select value={typeId} onChange={(e) => fetchScores(province, year, e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, background: "#fff" }}>
              {allTypes.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
            </select>
          </div>
        )}
      </div>

      {overview && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#e8f0fe", borderRadius: 8, fontSize: 14 }}>
          该省最低投档线：<strong>{overview.min}</strong> 分
          <span style={{ color: "#888" }}>（{overview.year}年，{TYPE_LABELS[overview.type] || overview.type}）</span>
        </div>
      )}

      {loading && <p className="loading">查询中...</p>}

      {error && (
        <div style={{ padding: 16, color: "#e74c3c", background: "#fdf0ef", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ color: "#999", fontSize: 14 }}>该条件暂无数据</p>
      )}

      {items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="score-table">
            <thead>
              <tr>
                <th>专业名称</th>
                <th>最低分</th>
                <th>最高分</th>
                <th>平均分</th>
                <th>位次</th>
                <th>批次</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{item.sp_name}</td>
                  <td>{item.min}</td>
                  <td>{item.max}</td>
                  <td>{item.average}</td>
                  <td>{item.min_section}</td>
                  <td>{item.local_batch_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
