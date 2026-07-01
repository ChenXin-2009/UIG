"""
Utility: 将新的 LLM 评分结果合并到最终数据中
使用方法: 将 LLM 输出的结果保存为 .json 文件后运行此脚本
"""
import json, os, glob, sys
sys.stdout = open(sys.stdout.fileno(), 'w', encoding='utf-8', buffering=1)

OUT_DIR = r'D:\BIAN\UIG\pipeline_output'
BATCH_DIR = os.path.join(OUT_DIR, 'batches_v2')
SRC = os.path.join(OUT_DIR, 'school_indices.json')

# Load current data
with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Load new LLM results
result_files = sorted(glob.glob(os.path.join(BATCH_DIR, 'batch_v2_*_result.json')),
                      key=lambda x: int(x.split('\\')[-1].split('_')[2].split('.')[0]))

if not result_files:
    print("未找到 LLM 结果文件。请将 LLM 输出的 JSON 数组保存为 batch_v2_*_result.json")
    print(f"放到目录: {BATCH_DIR}")
    sys.exit(1)

print(f"找到 {len(result_files)} 个 LLM 结果文件")

added = 0
for rf in result_files:
    with open(rf, 'r', encoding='utf-8') as f:
        content = f.read().strip()
        idx = content.find('[')
        if idx >= 0:
            content = content[idx:]
        items = json.loads(content)
    for item in items:
        sid = str(item['school_id'])
        idx_name = item['index_name']
        score = item['score']
        if sid in data and idx_name not in data[sid].get('indices', {}):
            data[sid]['indices'][idx_name] = score
            added += 1

# Save
with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Stats
INDEX_NAMES = [
    "bed_type","air_con","bathroom","self_study","morning_run",
    "running_km","holiday","delivery","traffic","washer",
    "internet","power_cut","canteen","hot_water","ebike",
    "power_limit","night_study","laptop","access","inspection"
]
total = len(data) * 20
actual = sum(len(d['indices']) for d in data.values())
all_20 = sum(1 for d in data.values() if len(d['indices']) == 20)
print(f"新增: {added} 条")
print(f"总条目: {actual}/{total} ({actual/total*100:.1f}%)")
print(f"20项齐全: {all_20}/{len(data)} 所({all_20/len(data)*100:.1f}%)")
print(f"已保存到: {SRC}")
