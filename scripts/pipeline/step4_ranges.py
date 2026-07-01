"""
Step 4: 为数值型指数计算范围 (min/max) 并添加到 school_indices.json
仅处理: running_km, holiday, hot_water, power_limit
"""
import json, re, sys
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)

FAQ_PATH = r'D:\BIAN\UIG\university-helper\data\faq.json'
DATA_PATH = r'D:\BIAN\UIG\pipeline_output\school_indices.json'

INDEX_MAP = {
    "跑步打卡": "running_km", "寒暑假": "holiday",
    "热水": "hot_water", "限电": "power_limit"
}

# Number extraction patterns (same as step1)
def extract_km(text):
    m = re.search(r"(\d+[\.]?\d*)\s*(公里|km)", text)
    return float(m.group(1)) if m else None

def extract_days(text):
    m = re.search(r"(\d+)\s*(天|日)", text)
    return float(m.group(1)) if m else None

def extract_watts(text):
    m = re.search(r"(\d+)\s*(w|瓦|W)", text)
    return float(m.group(1)) if m else None

def extract_hot_water(text):
    ranges = re.findall(r'(\d+)\s*[:：点\.]?\s*\d*\s*[-~到至]\s*(\d+)\s*[:：点\.]?', text)
    if ranges:
        hours = [max(0, int(e) - int(s)) for s, e in ranges]
        return sum(hours) / len(hours)
    if re.search(r'全天|24小时|24h|24H', text):
        return 24
    return None

EXTRACTORS = {
    "running_km": extract_km,
    "holiday": extract_days,
    "power_limit": extract_watts,
    "hot_water": extract_hot_water,
}

# Load FAQ
with open(FAQ_PATH, 'r', encoding='utf-8') as f:
    faq = json.load(f)

# Load current indices
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Map school name to ID for FAQ indexing
# FAQ is indexed by array position which = school_id
# But the FAQ is ordered the same as the school data, so array index = school_id

updates = 0
for sid_str, school_data in data.items():
    sid = int(sid_str)
    if sid >= len(faq):
        continue
    
    school_faq = faq[sid]
    ranges = {}
    
    for q_short, idx_name in INDEX_MAP.items():
        extractor = EXTRACTORS[idx_name]
        all_vals = []
        
        for qa in school_faq.get('answers', []):
            if qa.get('question_short') != q_short:
                continue
            for a in qa.get('answers', []):
                text = a['answer']
                v = extractor(text)
                if v is not None:
                    all_vals.append(v)
        
        if all_vals:
            ranges[idx_name] = {
                "min": round(min(all_vals), 1),
                "max": round(max(all_vals), 1)
            }
    
    if ranges:
        # Verify ranges are reasonable (capped same as indices)
        CAPS = {'running_km': 300, 'holiday': 180, 'hot_water': 24, 'power_limit': 9999}
        for idx, cap in CAPS.items():
            if idx in ranges:
                ranges[idx]['min'] = min(ranges[idx]['min'], cap)
                ranges[idx]['max'] = min(ranges[idx]['max'], cap)
        
        school_data['ranges'] = ranges
        updates += 1

# Save
with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Stats
total_ranges = sum(1 for d in data.values() if 'ranges' in d)
range_count = {}
for d in data.values():
    for k in d.get('ranges', {}):
        range_count[k] = range_count.get(k, 0) + 1

print(f"已更新: {updates} 所学校添加了范围数据")
print(f"\n各指数范围覆盖:")
for idx in ["running_km", "holiday", "hot_water", "power_limit"]:
    print(f"  {idx:<15}: {range_count.get(idx, 0)}/{len(data)} 所学校")

# Show some examples
print("\n示例:")
shown = 0
for sid_str, d in sorted(data.items(), key=lambda x: int(x[0])):
    if 'ranges' in d and shown < 5:
        name = d['name']
        for idx in ["running_km", "holiday", "hot_water", "power_limit"]:
            if idx in d.get('ranges', {}):
                r = d['ranges'][idx]
                main_v = d['indices'].get(idx, '?')
                print(f"  {name}.{idx}: 平均值={main_v}, 范围=[{r['min']}-{r['max']}]")
        shown += 1

print(f"\n已保存到: {DATA_PATH}")
