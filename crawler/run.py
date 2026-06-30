"""
爬虫运行入口
用法：python crawler/run.py [--skip-schools] [--skip-scores] [--skip-faq] [--fast]
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

from school_list import crawl as crawl_schools
from crawl_scores import crawl as crawl_scores
from parse_faq import crawl as crawl_faq


def build_search_index():
    """生成搜索索引"""
    schools_path = os.path.join(DATA_DIR, "schools.json")
    if not os.path.exists(schools_path):
        print("[索引] 未找到 schools.json，跳过")
        return

    with open(schools_path, "r", encoding="utf-8") as f:
        schools = json.load(f)

    index = []
    for s in schools:
        tags = []
        if s.get("f985") == "1":
            tags.append("985")
        if s.get("f211") == "1":
            tags.append("211")
        if "双一流" in s.get("dual_class_name", ""):
            tags.append("双一流")
        if s.get("nature_name") == "公办":
            tags.append("公办")
        if s.get("nature_name") == "民办":
            tags.append("民办")
        if s.get("level_name") == "本科":
            tags.append("本科")
        if "专科" in s.get("level_name", ""):
            tags.append("专科")
        pid = s.get("province_id", "")
        psm = s.get("province_score_min", {})
        own_score = psm.get(pid, {}) if isinstance(psm, dict) else {}
        index.append({
            "id": s["id"],
            "name": s["name"],
            "short": s.get("short", ""),
            "province": s.get("province_name", ""),
            "level": s.get("level_name", ""),
            "tags": tags,
            "ruanke": s.get("ruanke_rank", ""),
            "min_score": own_score.get("min", ""),
        })

    output_path = os.path.join(DATA_DIR, "search-index.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"[索引] 生成 {len(index)} 条搜索索引 -> {output_path}")


def print_stats():
    stats = {}
    for name in ["schools.json", "scores.json", "faq.json", "search-index.json"]:
        path = os.path.join(DATA_DIR, name)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            size = os.path.getsize(path)
            stats[name] = {"count": len(data) if isinstance(data, list) else "?", "size_kb": round(size / 1024, 1)}

    print("\n" + "=" * 50)
    print("数据统计")
    print("=" * 50)
    for name, info in stats.items():
        print(f"  {name:20s}  {info['count']:>6} 条  {info['size_kb']:>8.1f} KB")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(description="大学信息爬虫")
    parser.add_argument("--skip-schools", action="store_true", help="跳过学校列表爬取")
    parser.add_argument("--skip-scores", action="store_true", help="跳过分数线爬取")
    parser.add_argument("--skip-faq", action="store_true", help="跳过 FAQ 爬取")
    parser.add_argument("--fast", action="store_true", help="快速模式")
    args = parser.parse_args()

    if args.fast:
        args.skip_scores = True
        args.skip_faq = True

    if not args.skip_schools:
        crawl_schools()
    else:
        print("[跳过] 学校列表")

    if not args.skip_scores:
        crawl_scores()
    else:
        print("[跳过] 分数线")

    if not args.skip_faq:
        crawl_faq()
    else:
        print("[跳过] FAQ")

    build_search_index()
    print_stats()
    print("\n爬虫完成！运行 npm run build 即可生成前端。")


if __name__ == "__main__":
    main()
