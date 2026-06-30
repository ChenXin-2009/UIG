"""
爬虫2：录取分数线 - 断点续爬版
策略：全速爬直至被限流，保存进度，下次跳过已完成任务继续
"""
import json
import os
import time
import requests
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
PROGRESS_FILE = os.path.join(DATA_DIR, "scores_progress.json")

SCORE_API = "https://api.zjzw.cn/web/api/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.gaokao.cn/",
    "Origin": "https://www.gaokao.cn",
}

PROVINCE_TYPES = {
    "11": ["3"], "12": ["3"], "13": ["2073", "2074"],
    "14": ["2073", "1"], "15": ["2074", "2073", "1"],
    "21": ["2073"], "22": ["2073", "1"], "23": ["2073", "1"],
    "31": ["3"], "32": ["2073"], "33": ["3"],
    "34": ["2073", "1"], "35": ["2073"], "36": ["2073", "1"],
    "37": ["3"], "41": ["2073", "1"], "42": ["2073"],
    "43": ["2073"], "44": ["2073"], "45": ["2073", "1"],
    "46": ["3"], "50": ["2073"], "51": ["2073", "1"],
    "52": ["2073", "1"], "53": ["2073", "1"], "54": ["1"],
    "61": ["2073", "1"], "62": ["2073", "1"], "63": ["2073", "1"],
    "64": ["2073", "1"], "65": ["1"],
}

BATCH_IDS = ["7", "6", "8", "25", "46", "51"]
YEARS = [2024, 2025]

session = requests.Session()
session.headers.update(HEADERS)


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": [], "rate_limited": False, "rate_limited_at": None, "cooldown_hours": 24}


def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def task_key(school_id, year, type_id, batch_id):
    return f"{school_id}_{year}_{type_id}_{batch_id}"


def is_on_cooldown(progress):
    if not progress["rate_limited"] or not progress["rate_limited_at"]:
        return False
    cooldown_end = datetime.fromisoformat(progress["rate_limited_at"]) + timedelta(hours=progress["cooldown_hours"])
    if datetime.now() < cooldown_end:
        remaining = (cooldown_end - datetime.now()).total_seconds()
        print(f"[分数爬虫] 仍在冷却中，剩余 {remaining/3600:.1f} 小时")
        return True
    return False


def crawl(schools_file="schools.json"):
    progress = load_progress()

    if is_on_cooldown(progress):
        return

    schools_path = os.path.join(DATA_DIR, schools_file)
    with open(schools_path, "r", encoding="utf-8") as f:
        all_schools = json.load(f)

    # 只爬本科 + 重点
    priority = [s for s in all_schools if s.get("f985") == "1" or s.get("f211") == "1" or "双一流" in s.get("dual_class_name", "")]
    other = [s for s in all_schools if s.get("level_name") == "本科" and s not in priority]
    targets = priority + other

    completed_set = set(progress["completed"])
    all_scores = []

    # 加载已爬取的数据
    scores_path = os.path.join(DATA_DIR, "scores.json")
    if os.path.exists(scores_path):
        with open(scores_path, "r", encoding="utf-8") as f:
            all_scores = json.load(f)

    # 构建任务列表
    tasks = []
    for s in targets:
        pid = s.get("province_id", "")
        if pid not in PROVINCE_TYPES:
            continue
        for year in YEARS:
            for tid in PROVINCE_TYPES[pid]:
                for bid in BATCH_IDS:
                    key = task_key(s["id"], year, tid, bid)
                    if key not in completed_set:
                        tasks.append((s, pid, year, tid, bid, key))

    total = len(tasks) + len(completed_set)
    print(f"[分数爬虫] 目标学校 {len(targets)}, 已完成 {len(completed_set)}, 剩余 {len(tasks)}, 共 {total}")

    if not tasks:
        print("[分数爬虫] 全部完成！")
        return

    done = 0
    for school, pid, year, tid, bid, key in tasks:
        sid, sname = school["id"], school["name"]
        items = []

        for attempt in range(3):
            try:
                params = {
                    "local_batch_id": bid,
                    "local_province_id": pid,
                    "local_type_id": tid,
                    "page": 1,
                    "school_id": sid,
                    "size": "50",
                    "special_group": "",
                    "uri": "apidata/api/gk/score/special",
                    "year": str(year),
                }
                resp = session.get(SCORE_API, params=params, timeout=15)

                if resp.status_code == 429:
                    print(f"\n[!] 被限流 (429)! 已爬 {done} 个，保存进度并退出")
                    progress["rate_limited"] = True
                    progress["rate_limited_at"] = datetime.now().isoformat()
                    save_progress(progress)
                    # 保存已收集的数据
                    with open(scores_path, "w", encoding="utf-8") as f:
                        json.dump(all_scores, f, ensure_ascii=False, indent=2)
                    print(f"[分数爬虫] 已保存 {len(all_scores)} 条数据，下次运行将继续")
                    return

                if resp.status_code != 200:
                    break

                data = resp.json()

                if not isinstance(data, dict):
                    break

                if data.get("code") == "1069":
                    print(f"\n[!] 被限流 (code=1069)! 已爬 {done} 个，保存进度并退出")
                    progress["rate_limited"] = True
                    progress["rate_limited_at"] = datetime.now().isoformat()
                    save_progress(progress)
                    with open(scores_path, "w", encoding="utf-8") as f:
                        json.dump(all_scores, f, ensure_ascii=False, indent=2)
                    print(f"[分数爬虫] 已保存 {len(all_scores)} 条数据，下次运行将继续")
                    return

                if not isinstance(data, dict) or data.get("code") != "0000":
                    break

                items_data = data.get("data", {}).get("item", [])
                if items_data:
                    for item in items_data:
                        all_scores.append({
                            "school_id": sid,
                            "school_name": sname,
                            "year": year,
                            "local_province_name": item.get("local_province_name", ""),
                            "local_batch_name": item.get("local_batch_name", ""),
                            "local_type_name": item.get("local_type_name", ""),
                            "sp_name": item.get("sp_name", ""),
                            "spname": item.get("spname", ""),
                            "min": item.get("min", "-"),
                            "max": item.get("max", "-"),
                            "average": item.get("average", "-"),
                            "min_section": item.get("min_section", "-"),
                            "zslx_name": item.get("zslx_name", ""),
                            "level2_name": item.get("level2_name", ""),
                        })
                break
            except requests.exceptions.ConnectionError:
                print(f"\n[!] 连接错误，等待 5s 重试...")
                time.sleep(5)
                continue
            except Exception as e:
                print(f"\n[!] 请求异常: {e}")
                break

        done += 1
        completed_set.add(key)
        if done % 50 == 0:
            progress["completed"] = list(completed_set)
            save_progress(progress)
            # 同时保存数据
            with open(scores_path, "w", encoding="utf-8") as f:
                json.dump(all_scores, f, ensure_ascii=False, indent=2)
            print(f"  进度: {done}/{len(tasks)}, 共 {len(all_scores)} 条")

    # 全部完成
    progress["completed"] = list(completed_set)
    progress["rate_limited"] = False
    progress["rate_limited_at"] = None
    save_progress(progress)
    with open(scores_path, "w", encoding="utf-8") as f:
        json.dump(all_scores, f, ensure_ascii=False, indent=2)
    print(f"[分数爬虫] 全部完成！共 {len(all_scores)} 条记录 -> {scores_path}")


if __name__ == "__main__":
    crawl()
