# UIG — 中国大学信息指导

<img src="public/logoL.png" alt="logoL" width="50%" />

![Homepage screenshot](public/1.png)
*Homepage: search, filter, sort, and infinite-scroll browse of all universities*

A web app that helps Chinese students with 高考志愿 (college entrance exam application) selection by visualizing university information, admission scores, and FAQs.

## Features

- **Search & Filter**: Find universities by name, province, level, and tags (985/211/双一流)
- **School Details**: Overview, rankings, specialty tags, FAQ from student community
- **Score Charts**: Dynamic per-specialty admission scores by province/year/type
- **Compare**: Side-by-side comparison of up to 4 universities

![Peking University detail page](public/2.png)
*School detail page: basic info, specialties, score query, and campus FAQs*

## Tech Stack

- **Framework**: Next.js 14 (App Router, SSG + API routes)
- **Language**: TypeScript + React
- **Data**: Crawled from 掌上高考 (gaokao.cn) + community FAQ
- **Crawler**: Python (concurrent fetching of school list, scores, FAQ)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx next dev

# Build for production
npx next build
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (search + filter + school list)
│   │   ├── school/[id]/page.tsx  # School detail page
│   │   ├── compare/page.tsx      # Comparison page
│   │   └── api/scores/route.ts   # Score proxy API
│   ├── components/
│   │   ├── HomeClient.tsx        # Homepage client component
│   │   ├── SchoolCard.tsx        # School table row
│   │   ├── FaqSection.tsx        # FAQ accordion
│   │   └── CompareClient.tsx     # Comparison table
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── constants.ts          # Province/type constants
│       └── data.ts               # Server-side data loaders
├── crawler/
│   ├── run.py                    # Crawler entry point
│   ├── school_list.py            # Crawler 1: school list + basic info
│   ├── crawl_scores.py           # Crawler 2: admission scores (resumable)
│   └── parse_faq.py              # Crawler 3: parse community FAQ data
├── scripts/pipeline/             # Data processing pipeline
│   ├── step1_rule_match.py       # Rule-based index matching
│   ├── step2_prepare.py          # Prepare LLM batches
│   ├── step3_merge.py            # Merge results
│   ├── clean_outliers.py         # Outlier cleaning
│   └── verify_all.py             # Full verification
├── data/                         # Generated data files
│   ├── schools.json              # 2987 universities
│   ├── faq.json                  # 2207 matched FAQ entries
│   ├── scores.json               # Admission score data (frontend uses live API, this is a crawler backup)
│   ├── search-index.json         # Search index
│   └── school_indices.json       # 20 quality-of-life indices
└── 推.bat                        # Git release helper script
```

## Data Sources

- **School Data**: [掌上高考](https://www.gaokao.cn) — school list, profiles, rankings
- **Scores**: [掌上高考 API](https://api.zjzw.cn) — per-specialty admission scores (fetched live via proxy)
- **Campus FAQ**: [CollegesChat/university-information](https://github.com/CollegesChat/university-information) — community-contributed Q&A

## Running the Crawler

```bash
pip install requests tqdm
python crawler/run.py
```

## Running Tests

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## License

Apache 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

---

[中文 README](README.md)
