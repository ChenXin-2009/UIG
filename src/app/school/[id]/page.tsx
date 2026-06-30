import { notFound } from "next/navigation"
import { getSchoolById, getFaqBySchoolName, getAllSchoolIds } from "@/lib/data"
import { TAG_COLORS, PROVINCES, TYPE_LABELS } from "@/lib/constants"
import ScoreChart from "@/components/ScoreChart"
import FaqSection from "@/components/FaqSection"

export function generateStaticParams() {
  return getAllSchoolIds().map((id) => ({ id }))
}

export default function SchoolPage({ params }: { params: { id: string } }) {
  const school = getSchoolById(params.id)
  if (!school) notFound()

  const faq = getFaqBySchoolName(school.name)

  const tags: string[] = []
  if (school.f985 === "1") tags.push("985")
  if (school.f211 === "1") tags.push("211")
  if (school.dual_class_name?.includes("双一流")) tags.push("双一流")
  if (school.nature_name) tags.push(school.nature_name)
  if (school.level_name) tags.push(school.level_name)

  const provinceName = PROVINCES.find((p) => p.id === school.province_id)?.name || school.province_name

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
        <div className="breadcrumb">
          <a href="/">首页</a> / {school.name}
        </div>

        <div className="school-detail">
          <h1>{school.name}</h1>
          <div className="tags">
            {tags.map((t) => (
              <span key={t} className="tag" style={{ backgroundColor: TAG_COLORS[t] || "#95a5a6" }}>
                {t}
              </span>
            ))}
          </div>

          <div className="info-grid">
            <div className="info-item"><span className="label">所在地：</span>{provinceName} {school.city_name}</div>
            <div className="info-item"><span className="label">办学层次：</span>{school.level_name}</div>
            <div className="info-item"><span className="label">办学性质：</span>{school.nature_name}</div>
            <div className="info-item"><span className="label">院校类型：</span>{school.type_name}</div>
            <div className="info-item"><span className="label">主管部门：</span>{school.belong || "-"}</div>
            <div className="info-item"><span className="label">成立时间：</span>{school.create_date || "-"}</div>
            {school.site && <div className="info-item"><span className="label">官网：</span><a href={school.site} target="_blank" rel="noopener noreferrer" style={{ color: "#1a73e8" }}>{school.site}</a></div>}
            {school.phone && <div className="info-item"><span className="label">招生电话：</span>{school.phone}</div>}
            {school.address && <div className="info-item"><span className="label">地址：</span>{school.address}</div>}
            {school.email && <div className="info-item"><span className="label">邮箱：</span>{school.email}</div>}
          </div>

          <div className="info-grid" style={{ marginBottom: 24 }}>
            {school.ruanke_rank && <div className="info-item"><span className="label">软科排名：</span>第 {school.ruanke_rank} 名</div>}
            {school.xyh_rank && <div className="info-item"><span className="label">校友会排名：</span>第 {school.xyh_rank} 名</div>}
            {school.qs_world && <div className="info-item"><span className="label">QS世界排名：</span>第 {school.qs_world} 名</div>}
            {school.us_rank && <div className="info-item"><span className="label">US News排名：</span>第 {school.us_rank} 名</div>}
            <div className="info-item"><span className="label">硕士点：</span>{school.num_master || "-"}</div>
            <div className="info-item"><span className="label">博士点：</span>{school.num_doctor || "-"}</div>
            <div className="info-item"><span className="label">重点学科：</span>{school.num_subject || "-"}</div>
            <div className="info-item"><span className="label">院士：</span>{school.num_academician || "-"}</div>
          </div>

          {school.special && school.special.length > 0 && (
            <>
              <div className="section-title">特色专业</div>
              <div className="special-list">
                {school.special.map((sp, i) => (
                  <span key={i} className="special-tag">{sp.special_name}</span>
                ))}
              </div>
            </>
          )}

          <div className="section-title">录取分数线</div>
          <ScoreChart school={school} />

          {faq && (
            <>
              <div className="section-title">校园问答</div>
              <FaqSection faq={faq} />
            </>
          )}

          {school.content && (
            <>
              <div className="section-title">学校简介</div>
              <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{school.content}</div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
