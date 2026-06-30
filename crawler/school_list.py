"""
爬虫1：获取学校列表 + 基本信息 + 排名
来源：掌上高考 static-data.gaokao.cn 静态接口（无需鉴权）
"""
import json
import time
import os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

SCHOOL_CODE_URL = "https://static-data.gaokao.cn/www/2.0/school/school_code.json"
INFO_URL = "https://static-data.gaokao.cn/www/2.0/school/{}/info.json"
RANK_URL = "https://static-data.gaokao.cn/www/2.0/school/{}/rank.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.gaokao.cn/",
}

PROVINCE_NAMES = {
    "11": "北京", "12": "天津", "13": "河北", "14": "山西", "15": "内蒙古",
    "21": "辽宁", "22": "吉林", "23": "黑龙江",
    "31": "上海", "32": "江苏", "33": "浙江", "34": "安徽", "35": "福建",
    "36": "江西", "37": "山东",
    "41": "河南", "42": "湖北", "43": "湖南", "44": "广东", "45": "广西", "46": "海南",
    "50": "重庆", "51": "四川", "52": "贵州", "53": "云南", "54": "西藏",
    "61": "陕西", "62": "甘肃", "63": "青海", "64": "宁夏", "65": "新疆",
}

SCHOOL_TYPES = {
    "5001": "理工类", "5002": "综合类", "5003": "语言类", "5004": "艺术类",
    "5005": "农林类", "5006": "民族类", "5007": "医药类", "5008": "师范类",
    "5009": "财经类", "5010": "体育类", "5011": "政法类", "5012": "军事类",
}

SCHOOL_NATURES = {
    "36000": "公办", "36001": "民办", "36002": "内地与港澳台地区合作办学",
    "36003": "中外合作办学",
}

SCHOOL_LEVELS = {
    "2001": "本科", "2002": "专科（高职）", "2003": "成人高校",
}


def fetch_school_code():
    """获取学校代码列表"""
    print("[1/3] 下载学校列表...")
    resp = requests.get(SCHOOL_CODE_URL, headers=HEADERS, timeout=30)
    data = resp.json()
    schools = []
    for code, info in data["data"].items():
        schools.append({
            "code": code,
            "school_id": str(info["school_id"]),
            "name": info["name"],
        })
    print(f"  共 {len(schools)} 所学校")
    return schools


def fetch_school_info(school_id):
    """获取某所学校的详细信息"""
    try:
        resp = requests.get(INFO_URL.format(school_id), headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("code") != "0000":
            return None
        d = data["data"]
        province_id = str(d.get("province_id", ""))
        return {
            "id": school_id,
            "code": str(d.get("data_code", "")),
            "name": d.get("name", ""),
            "short": d.get("short", ""),
            "province_id": province_id,
            "province_name": PROVINCE_NAMES.get(province_id, d.get("province_name", "")),
            "city_name": d.get("city_name", ""),
            "town_name": d.get("town_name", ""),
            "level": str(d.get("level", "")),
            "level_name": SCHOOL_LEVELS.get(str(d.get("level", "")), d.get("level_name", "")),
            "type": str(d.get("type", "")),
            "type_name": SCHOOL_TYPES.get(str(d.get("type", "")), d.get("type_name", "")),
            "nature": str(d.get("school_nature", "")),
            "nature_name": SCHOOL_NATURES.get(str(d.get("school_nature", "")), d.get("school_nature_name", "")),
            "belong": d.get("belong", ""),
            "f985": d.get("f985", "2"),
            "f211": d.get("f211", "2"),
            "dual_class": d.get("dual_class", "38000"),
            "dual_class_name": d.get("dual_class_name", ""),
            "create_date": d.get("create_date", ""),
            "area": d.get("area", 0),
            "content": d.get("content", ""),
            "site": d.get("site", ""),
            "school_site": d.get("school_site", ""),
            "phone": d.get("phone", ""),
            "email": d.get("email", ""),
            "address": d.get("address", ""),
            "postcode": d.get("postcode", ""),
            "ruanke_rank": str(d.get("ruanke_rank", "")),
            "xyh_rank": str(d.get("xyh_rank", "")),
            "qs_world": str(d.get("qs_world", "")),
            "us_rank": str(d.get("us_rank", "")),
            "num_master": str(d.get("num_master", "0")),
            "num_doctor": str(d.get("num_doctor", "0")),
            "num_subject": str(d.get("num_subject", "0")),
            "num_academician": str(d.get("num_academician", "0")),
            "num_library": str(d.get("num_library", "0")),
            "num_lab": str(d.get("num_lab", "0")),
            "label_list": d.get("label_list", []),
            "attr_list": d.get("attr_list", []),
            "special_raw": d.get("special", []),
            "province_score_min": d.get("province_score_min", {}),
            "pro_type_min": d.get("pro_type_min", {}),
            "pro_type": d.get("pro_type", {}),
            "fenxiao": d.get("fenxiao", []),
        }
    except Exception as e:
        return None


def crawl():
    schools_meta = fetch_school_code()
    results = []
    errors = 0

    print("[2/3] 下载学校详细信息（并发 8 线程）...")
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_school_info, s["school_id"]): s for s in schools_meta}
        for future in tqdm(as_completed(futures), total=len(futures)):
            result = future.result()
            if result:
                results.append(result)
            else:
                errors += 1

    results.sort(key=lambda x: int(x["id"]) if x["id"].isdigit() else 0)
    print(f"  成功: {len(results)}, 失败: {errors}")

    output_path = os.path.join(DATA_DIR, "schools.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[3/3] 已保存到 {output_path}")
    return results


if __name__ == "__main__":
    crawl()
