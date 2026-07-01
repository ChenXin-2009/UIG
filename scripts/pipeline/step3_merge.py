import json, os, glob, sys
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)

OUT_DIR = r'D:\BIAN\UIG\pipeline_output'
BATCH_DIR = os.path.join(OUT_DIR, 'batches')
DATA_PATH = r'D:\BIAN\UIG\university-helper\data\faq.json'

# Load FAQ for fallback analysis
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    all_schools = json.load(f)

# 1. Load new rule-matched results
with open(os.path.join(OUT_DIR, 'step1_matched.json'), 'r', encoding='utf-8') as f:
    new_matched = json.load(f)
print(f"新规则匹配结果: {len(new_matched)} 所学校")

# 2. Load old LLM results
result_files = sorted(glob.glob(os.path.join(BATCH_DIR, 'batch_*_result.json')),
                      key=lambda x: int(x.split('\\')[-1].split('_')[1].split('.')[0]))
print(f"旧LLM结果文件: {len(result_files)} 个")

old_llm = {}
for rf in result_files:
    with open(rf, 'r', encoding='utf-8') as f:
        items = json.loads(f.read().lstrip('\ufeff'))
    for item in items:
        key = f"{item['school_id']}_{item['index_name']}"
        old_llm[key] = item['score']
print(f"旧LLM评分条目: {len(old_llm)} 条")

# 3. Build fallback for power_limit where FAQ clearly indicates unlimited
def check_power_limit_unlimited(school_faq):
    """Check if all 限电 answers mean 'no power limit'"""
    for qa in school_faq.get('answers', []):
        if qa.get('question_short') != '限电':
            continue
        texts = [a['answer'] for a in qa.get('answers', [])]
        # All answers are "没有"/"无"/"没"/"不限"
        unlimited_keywords = {"没有", "无", "没", "不限", "无限电", "不断电"}
        if all(t.strip() in unlimited_keywords for t in texts):
            return True
        # Also single answer "不限" 
        if any(t.strip() == "不限" for t in texts):
            return True
    return False

INDEX_NAMES = [
    "bed_type", "air_con", "bathroom", "self_study", "morning_run",
    "running_km", "holiday", "delivery", "traffic", "washer",
    "internet", "power_cut", "canteen", "hot_water", "ebike",
    "power_limit", "night_study", "laptop", "access", "inspection"
]

INDEX_KEY_TO_QSHORT = {
    "bed_type":"上床下桌", "air_con":"空调", "bathroom":"独立卫浴",
    "self_study":"早晚自习", "morning_run":"晨跑", "running_km":"跑步打卡",
    "holiday":"寒暑假", "delivery":"外卖", "traffic":"交通",
    "washer":"洗衣机", "internet":"校园网", "power_cut":"断电断网",
    "canteen":"食堂", "hot_water":"热水", "ebike":"电瓶车",
    "power_limit":"限电", "night_study":"通宵自习", "laptop":"带电脑",
    "access":"门禁", "inspection":"查寝"
}

final = {}
stats_rule = 0
stats_llm = 0
stats_fallback = 0
stats_missing = 0

for sid_str, school_data in new_matched.items():
    sid = int(sid_str)
    name = school_data['name']
    indices = {}

    for idx_name in INDEX_NAMES:
        # Priority 1: new rule match
        if idx_name in school_data.get('indices', {}):
            indices[idx_name] = school_data['indices'][idx_name]
            stats_rule += 1
            continue

        # Priority 2: old LLM result
        key = f"{sid}_{idx_name}"
        if key in old_llm:
            indices[idx_name] = old_llm[key]
            stats_llm += 1
            continue

        # Priority 3: fallback for power_limit
        if idx_name == "power_limit" and sid < len(all_schools):
            if check_power_limit_unlimited(all_schools[sid]):
                indices[idx_name] = 9999
                stats_fallback += 1
                continue

        # No data available
        stats_missing += 1

    final[sid] = {
        "name": name,
        "indices": {k: v for k, v in sorted(indices.items())}
    }

# 4. Save
OUTPUT_PATH = os.path.join(OUT_DIR, 'school_indices.json')
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

# 5. Statistics
total_schools = len(final)
total_potential = total_schools * 20
actual_entries = sum(len(r['indices']) for r in final.values())
schools_with_all = sum(1 for r in final.values() if len(r['indices']) == 20)

print(f"\n=== 合并统计 ===")
print(f"规则匹配: {stats_rule:>6} 项")
print(f"旧LLM:    {stats_llm:>6} 项")
print(f"启发式:    {stats_fallback:>6} 项 (power_limit 不限电)")
print(f"缺失:      {stats_missing:>6} 项")
print(f"总条目:    {actual_entries}/{total_potential} 项 ({actual_entries/total_potential*100:.1f}%)")
print(f"20项齐全:  {schools_with_all}/{total_schools} 所学校 ({schools_with_all/total_schools*100:.1f}%)")

# 6. Power limit distribution
print("\n=== power_limit 分布 ===")
pl_buckets = {}
for sid, data in final.items():
    pl = data['indices'].get('power_limit')
    if pl is None:
        b = "missing"
    elif pl == 0:
        b = "0"
    elif pl == 9999:
        b = "9999(不限)"
    elif pl < 100:
        b = "1-99"
    elif pl < 500:
        b = "100-499"
    elif pl < 1000:
        b = "500-999"
    elif pl < 5000:
        b = "1000-4999"
    elif pl < 9999:
        b = "5000-9998"
    else:
        b = "other"
    pl_buckets[b] = pl_buckets.get(b, 0) + 1
for b in ["missing","0","1-99","100-499","500-999","1000-4999","5000-9998","9999(不限)"]:
    print(f"  {b:>15}: {pl_buckets.get(b,0)} 所")

# 7. Show schools that still have power_limit=0
print("\n=== power_limit=0 的学校 (需审查) ===")
for sid_str in sorted(final.keys(), key=int):
    data = final[sid_str]
    pl = data['indices'].get('power_limit')
    if pl == 0:
        sid = int(sid_str)
        school_faq = all_schools[sid] if sid < len(all_schools) else None
        if school_faq:
            for qa in school_faq.get('answers', []):
                if qa.get('question_short') == '限电':
                    answers = [a['answer'] for a in qa.get('answers', [])]
                    print(f"  {data['name']}: 原回答={answers}")
                    break

# 8. Count missing by index type
print("\n=== 缺失按指数分布 ===")
missing_by_idx = {}
for sid_str, school_data in new_matched.items():
    sid = int(sid_str)
    for idx_name in INDEX_NAMES:
        if idx_name in school_data.get('indices', {}):
            continue
        key = f"{sid}_{idx_name}"
        if key in old_llm:
            continue
        if idx_name == "power_limit" and sid < len(all_schools) and check_power_limit_unlimited(all_schools[sid]):
            continue
        missing_by_idx[idx_name] = missing_by_idx.get(idx_name, 0) + 1

print(f"  {'指数':<15} {'缺失数':<8}")
for idx in INDEX_NAMES:
    count = missing_by_idx.get(idx, 0)
    if count > 0:
        print(f"  {idx:<15} {count:<8}")

print(f"\n已保存到: {OUTPUT_PATH}")
