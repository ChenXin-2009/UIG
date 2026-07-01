"""
Pipeline Step 1 (v2): 严格1:1规则匹配
- 二值指数: 仅精准匹配单字/标准词汇, 逐条评估后平均
- 数值指数: 数字提取优先, 特殊语意单独处理
- 综合指数: 不进行规则匹配, 全部→LLM
- 未匹配: 导出待 LLM 处理
"""

import json, re, os, math
from collections import Counter

DATA_PATH = r'D:\BIAN\UIG\university-helper\data\faq.json'
OUT_DIR = r'D:\BIAN\UIG\pipeline_output'
os.makedirs(OUT_DIR, exist_ok=True)

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    all_schools = json.load(f)
print(f"加载完成: {len(all_schools)} 所学校")

# ── 20 个指数定义 ──
INDICES = [
    ("上床下桌",   "bed_type",      "二值"),
    ("空调",       "air_con",       "二值"),
    ("独立卫浴",    "bathroom",      "二值"),
    ("早晚自习",    "self_study",    "二值"),
    ("晨跑",       "morning_run",   "二值"),
    ("跑步打卡",    "running_km",    "数值"),
    ("寒暑假",     "holiday",       "数值"),
    ("外卖",       "delivery",      "二值"),
    ("交通",       "traffic",       "综合"),
    ("洗衣机",     "washer",        "二值"),
    ("校园网",     "internet",      "综合"),
    ("断电断网",    "power_cut",     "综合"),
    ("食堂",       "canteen",       "综合"),
    ("热水",       "hot_water",     "数值"),
    ("电瓶车",     "ebike",         "二值"),
    ("限电",       "power_limit",   "数值"),
    ("通宵自习",    "night_study",  "二值"),
    ("带电脑",     "laptop",        "二值"),
    ("门禁",       "access",        "综合"),
    ("查寝",       "inspection",    "综合"),
]
Q_SHORT_TO_IDX = {q: name for q, name, _ in INDICES}

BINARY_KEYS = {"bed_type","air_con","bathroom","self_study","morning_run",
               "delivery","washer","night_study","laptop","ebike","power_cut"}
NUMERIC_KEYS = {"running_km","holiday","hot_water","power_limit"}
COMPOSITE_KEYS = {"traffic","internet","canteen","access","inspection"}

SKIP_QUESTIONS = {"共享单车", "快递", "校园卡", "超市", "银行卡"}

# ── 严格1:1 映射表 (仅精确匹配,整句对比) ──
YES_WORDS = {"是", "对", "正确", "有", "能", "可以", "允许", "支持", "可", "是的", "没错", "对的", "有的"}
NO_WORDS = {"否", "不是", "不对", "错", "没有", "无", "没", "不可以", "不允许", "不支持", "不能", "不会", "不可", "从不"}

# 限电: 不限电相关表达 → 9999W
UNLIMITED_WORDS = {"不限"}

# ── 处理函数 ──
def is_yes(text):
    t = text.strip().lower()
    return t in YES_WORDS

def is_no(text):
    t = text.strip().lower()
    return t in NO_WORDS

def is_unlimited(text):
    t = text.strip()
    return t in UNLIMITED_WORDS

def extract_num(text, pattern):
    m = re.search(pattern, text)
    return float(m.group(1)) if m else None

# ── 逐学校处理 ──
matched_results = {}
unmatched_items = []
stats = Counter()

for sid, school in enumerate(all_schools):
    name = school['name']
    matched_results[sid] = {"name": name, "indices": {}}

    for qa in school.get('answers', []):
        q_short = qa.get('question_short', '')
        if q_short in SKIP_QUESTIONS:
            continue
        idx_name = Q_SHORT_TO_IDX.get(q_short)
        if not idx_name:
            continue

        texts = [a['answer'] for a in qa.get('answers', [])]

        # ── 综合指数: 全部→LLM ──
        if idx_name in COMPOSITE_KEYS:
            unmatched_items.append({
                "school_id": sid, "school": name,
                "index_name": idx_name, "question_short": q_short,
                "raw_answers": texts
            })
            stats[f"{idx_name}_unmatched"] += 1
            continue

        # ── 数值指数: 数字提取优先 ──
        if idx_name in NUMERIC_KEYS:
            # 先尝试数字提取
            num_patterns = {
                "running_km": r"(\d+[\.]?\d*)\s*(公里|km)",
                "holiday":    r"(\d+)\s*(天|日)",
                "power_limit": r"(\d+)\s*(w|瓦|W)",
            }
            if idx_name in num_patterns:
                nums = [extract_num(t, num_patterns[idx_name]) for t in texts]
                nums = [n for n in nums if n is not None]
                if nums:
                    matched_results[sid]["indices"][idx_name] = round(sum(nums) / len(nums), 1)
                    stats[f"{idx_name}_num"] += 1
                    continue

            # power_limit: "不限"→9999
            if idx_name == "power_limit":
                unlimited = [t for t in texts if is_unlimited(t)]
                if unlimited:
                    matched_results[sid]["indices"][idx_name] = 9999
                    stats[f"{idx_name}_unlimited"] += 1
                    continue

            # running_km: 无要求→0 (仅当全部回答都是"无/没有")
            if idx_name == "running_km":
                if all(is_no(t) or t.strip() in {"灭有","没有要求","无跑步打卡","0公里"} for t in texts):
                    matched_results[sid]["indices"][idx_name] = 0
                    stats[f"{idx_name}_zero"] += 1
                    continue

            # hot_water: 时间范围提取
            if idx_name == "hot_water":
                hours = []
                for t in texts:
                    ranges = re.findall(r'(\d+)\s*[:：点\.]?\s*\d*\s*[-~到至]\s*(\d+)\s*[:：点\.]?', t)
                    if ranges:
                        h = sum(max(0, int(e) - int(s)) for s, e in ranges)
                        hours.append(h)
                        continue
                    if re.search(r'全天|24小时|24h|24H', t):
                        hours.append(24)
                        continue
                    if is_no(t):
                        hours.append(0)
                        continue
                if hours:
                    matched_results[sid]["indices"][idx_name] = round(sum(hours) / len(hours), 1)
                    stats[f"{idx_name}_hours"] += 1
                    continue

            # 未匹配 → LLM
            unmatched_items.append({
                "school_id": sid, "school": name,
                "index_name": idx_name, "question_short": q_short,
                "raw_answers": texts
            })
            stats[f"{idx_name}_unmatched"] += 1
            continue

        # ── 二值指数: 逐条严格1:1匹配后平均 ──
        scores = []
        for t in texts:
            if is_yes(t):
                scores.append(100)
            elif is_no(t):
                scores.append(0)

        if scores:
            matched_results[sid]["indices"][idx_name] = round(sum(scores) / len(scores), 1)
            stats[f"{idx_name}_yesno"] += 1
            continue

        # 混合回答无法判定 → LLM
        unmatched_items.append({
            "school_id": sid, "school": name,
            "index_name": idx_name, "question_short": q_short,
            "raw_answers": texts
        })
        stats[f"{idx_name}_unmatched"] += 1

# ── 保存 ──
with open(os.path.join(OUT_DIR, 'step1_matched.json'), 'w', encoding='utf-8') as f:
    json.dump(matched_results, f, ensure_ascii=False, indent=2)
print(f"规则匹配完成: {sum(1 for r in matched_results.values() if r['indices'])} 所学校有匹配数据")

with open(os.path.join(OUT_DIR, 'step1_unmatched.json'), 'w', encoding='utf-8') as f:
    json.dump(unmatched_items, f, ensure_ascii=False, indent=2)
print(f"未匹配条目: {len(unmatched_items)} 条")

# ── 统计 ──
print("\n=== 统计 ===")
print(f"{'指数':<15} {'规则命中':>8} {'未匹配':>8}")
for _, idx_name, _ in INDICES:
    hit = stats.get(f"{idx_name}_yesno", 0) + stats.get(f"{idx_name}_num", 0) + stats.get(f"{idx_name}_zero", 0) + stats.get(f"{idx_name}_hours", 0) + stats.get(f"{idx_name}_unlimited", 0)
    miss = stats.get(f"{idx_name}_unmatched", 0)
    total = hit + miss
    pct = hit / total * 100 if total else 0
    print(f"{idx_name:<15} {hit:>8}/{total:<8} ({pct:>5.1f}%)")

total_hit = sum(stats.get(f"{idx_name}_yesno",0)+stats.get(f"{idx_name}_num",0)+stats.get(f"{idx_name}_zero",0)+stats.get(f"{idx_name}_hours",0)+stats.get(f"{idx_name}_unlimited",0) for _,idx_name,_ in INDICES)
total_miss = len(unmatched_items)
print(f"\n总计: 规则匹配 {total_hit}, 需LLM {total_miss}, 规则覆盖率 {total_hit/(total_hit+total_miss)*100:.1f}%")
