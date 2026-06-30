# UIG — 大学信息指南

A web app that helps Chinese students with 高考志愿 selection by visualizing university information, admission scores, and FAQs.

## Features

- **Search & Filter**: Find universities by name, province, level, and tags (985/211/双一流)
- **School Details**: Overview, rankings, specialty tags, FAQ from student community
- **Score Charts**: Dynamic per-specialty admission scores by province/year/type
- **Compare**: Side-by-side comparison of up to 4 universities

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSG + API routes)
- **Language**: TypeScript
- **Data**: Crawled from 掌上高考 (gaokao.cn) + community FAQ
- **Deployment**: Vercel (serverless)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npx next dev

# Build for production
npx next build
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (search + filter + cards)
│   │   ├── school/[id]/page.tsx  # School detail page
│   │   ├── compare/page.tsx      # Comparison page
│   │   └── api/scores/route.ts   # Score proxy API
│   ├── components/
│   │   ├── HomeClient.tsx        # Homepage client component
│   │   ├── SchoolCard.tsx        # University card with score
│   │   ├── ScoreChart.tsx        # Dynamic score table
│   │   ├── FaqSection.tsx        # FAQ accordion
│   │   └── CompareClient.tsx     # Comparison table
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── constants.ts          # Province/type constants
│       └── data.ts               # Server-side data loaders
├── crawler/
│   └── run.py                    # Data crawler (Python)
├── data/
│   ├── schools.json              # 2987 universities
│   ├── faq.json                  # 2207 matched FAQ entries
│   └── search-index.json         # Search index
└── 推.bat                        # Release helper script
```

## Data Sources

- **学校数据**: [掌上高考](https://www.gaokao.cn) — school list, profiles, rankings
- **分数线**: [掌上高考 API](https://api.zjzw.cn) — per-specialty admission scores (fetched live via proxy)
- **FAQ**: [CollegesChat/university-information](https://github.com/CollegesChat/university-information) — community-contributed Q&A

## License

Apache 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).
