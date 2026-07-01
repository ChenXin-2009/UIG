import json, os, math, sys
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)

OUT_DIR = r'D:\BIAN\UIG\pipeline_output'
BATCH_DIR = os.path.join(OUT_DIR, 'batches_v2')
os.makedirs(BATCH_DIR, exist_ok=True)

# Load the items that still need LLM scoring
with open(os.path.join(OUT_DIR, 'step1_unmatched.json'), 'r', encoding='utf-8') as f:
    all_unmatched = json.load(f)

# Load old LLM results to know which ones are covered
result_files = sorted(__import__('glob').glob(os.path.join(OUT_DIR, 'batches', 'batch_*_result.json')),
                      key=lambda x: int(x.split('\\')[-1].split('_')[1].split('.')[0]))
old_llm = {}
for rf in result_files:
    with open(rf, 'r', encoding='utf-8') as f:
        items = json.loads(f.read().lstrip('\ufeff'))
    for item in items:
        old_llm[f"{item['school_id']}_{item['index_name']}"] = item['score']

# Items that are STILL not covered
need_llm = [item for item in all_unmatched 
            if f"{item['school_id']}_{item['index_name']}" not in old_llm]

# Load FAQ for the comprehensive context
with open(r'D:\BIAN\UIG\university-helper\data\faq.json', 'r', encoding='utf-8') as f:
    faq = json.load(f)

# For each item, add all FAQ context for this school
for item in need_llm:
    sid = item['school_id']
    if sid < len(faq):
        school_faq = faq[sid]
        # Add some context
        item['school_name'] = school_faq['name']
        # Add ALL answers for this index as context
        for qa in school_faq.get('answers', []):
            if qa.get('question_short') == item.get('question_short', ''):
                item['all_answers'] = [a['answer'] for a in qa.get('answers', [])]
                break

print(f"需要LLM评分的条目: {len(need_llm)} 条")

# Group by index for statistics
index_count = {}
for item in need_llm:
    idx = item['index_name']
    index_count[idx] = index_count.get(idx, 0) + 1
print("\n按指数分布:")
for idx, count in sorted(index_count.items(), key=lambda x: -x[1]):
    print(f"  {idx:<15}: {count}")

# Generate batches
BATCH_SIZE = 500
num_batches = math.ceil(len(need_llm) / BATCH_SIZE)

PROMPT_BEFORE = """You are a university life index scoring assistant.
Score each item below based on raw student answers.
Output a JSON array ONLY, no other text.
Each element: {"school_id": int, "index_name": str, "score": float, "reason": str}

Standards:
  bed_type (bunk bed): 0-100, 100=all upper-bed-desk, 0=none
  air_con (AC): 0-100, 100=classroom+dorm both have, 0=none
  bathroom (private bath): 0-100, 100=all have, 0=none(public bath)
  self_study: 0-100, 100=NO self-study(GOOD), 0=mandatory
  morning_run: 0-100, 100=NO morning run(GOOD), 0=mandatory
  running_km: raw km, no limit, 0=no requirement
  holiday: raw days total(winter+summer), no limit
  delivery: 0-100, 100=allowed to dorm, 0=forbidden
  traffic: 0-100, 100=city+subway, 0=remote mountain
  washer: 0-100, 100=every floor has, 0=none
  internet: 0-100, 100=fast+stable+cheap, 0=slow+expensive
  power_cut: 0-100, 100=never cut, 0=cut daily
  canteen: 0-100, 100=cheap+tasty, 0=expensive+bad
  hot_water: raw hours/day, no limit, 24h=24, none=0
  ebike: 0-100, 100=allowed+charging, 0=forbidden
  power_limit: raw watts, no limit, unlimited=9999
  night_study: 0-100, 100=has place, 0=none
  laptop: 0-100, 100=allowed, 0=not allowed
  access: 0-100, 100=free, 0=strict(11pm curfew)
  inspection: 0-100, 100=never inspects, 0=daily+no late return

IMPORTANT: read ALL raw_answers for each item carefully, be objective.
Output valid JSON array only.

===== DATA =====

"""

for batch_idx in range(num_batches):
    start = batch_idx * BATCH_SIZE
    end = min(start + BATCH_SIZE, len(need_llm))
    batch_items = need_llm[start:end]

    content = PROMPT_BEFORE
    content += json.dumps(batch_items, ensure_ascii=False, indent=2)
    content += '\n\n===== Output JSON array ====='

    filename = 'batch_v2_{:03d}.txt'.format(batch_idx + 1)
    filepath = os.path.join(BATCH_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"\n已生成 {num_batches} 个批处理文件到 {BATCH_DIR}")
print(f"每个文件 {BATCH_SIZE} 条, 最后一个 {len(need_llm) % BATCH_SIZE if num_batches > 0 else 0} 条")
print(f"\n使用方法: 将 batch_v2_*.txt 送入 LLM 处理, 返回结果保存为 batch_v2_*_result.json")
print(f"然后运行 update_with_llm.py 合并到最终数据")
