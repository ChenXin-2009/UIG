import { NextRequest, NextResponse } from "next/server"

const SCORE_API = "https://api.zjzw.cn/web/api/"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const school_id = searchParams.get("school_id")
  const province_id = searchParams.get("province_id")
  const year = searchParams.get("year")
  const type_id = searchParams.get("type_id")
  const batch_id = searchParams.get("batch_id") || "7"
  const page = searchParams.get("page") || "1"

  if (!school_id || !province_id || !year || !type_id) {
    return NextResponse.json({ error: "缺少参数: school_id, province_id, year, type_id" }, { status: 400 })
  }

  const params = new URLSearchParams({
    uri: "apidata/api/gk/score/special",
    school_id,
    local_province_id: province_id,
    local_type_id: type_id,
    year,
    page,
    size: "200",
    local_batch_id: batch_id,
    special_group: "",
  })

  try {
    const resp = await fetch(`${SCORE_API}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UniversityHelper/1.0)",
        "Referer": "https://www.gaokao.cn/",
        "Origin": "https://www.gaokao.cn",
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!resp.ok) {
      return NextResponse.json({ error: `上游API错误: ${resp.status}` }, { status: 502 })
    }

    const data = await resp.json()

    if (data.code === "1069") {
      return NextResponse.json({ error: "上游API限流，请稍后重试" }, { status: 429 })
    }

    if (data.code !== "0000") {
      return NextResponse.json({ items: [], numFound: 0 })
    }

    return NextResponse.json({
      items: data.data?.item || [],
      numFound: data.data?.numFound || 0,
    })
  } catch (e) {
    return NextResponse.json({ error: "请求超时或失败" }, { status: 504 })
  }
}
