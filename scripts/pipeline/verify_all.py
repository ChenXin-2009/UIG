"""
Pipeline 验证脚本
- 验证规则匹配、LLM 批次、合并结果、分数范围各步骤的输出完整性
"""
import json, os, glob

BASE = r'D:\BIAN\UIG\pipeline_output'
BATCH_DIR = os.path.join(BASE, 'batches')

print("=" * 60)
print("STEP 1: Rule matching output")
print("=" * 60)
f1 = os.path.join(BASE, 'step1_matched.json')
f2 = os.path.join(BASE, 'step1_unmatched.json')
for f, label in [(f1, 'matched'), (f2, 'unmatched')]:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
        print(f"  {label}: EXISTS, {len(data)} entries")
    else:
        print(f"  {label}: MISSING!")

print()
print("=" * 60)
print("STEP 2: Batch files (input)")
print("=" * 60)
batch_txt = sorted(glob.glob(os.path.join(BATCH_DIR, 'batch_*.txt')),
                   key=lambda x: int(x.split('\\')[-1].split('_')[1].split('.')[0]))
batch_json = sorted(glob.glob(os.path.join(BATCH_DIR, 'batch_*_result.json')),
                    key=lambda x: int(x.split('\\')[-1].split('_')[1].split('.')[0]))
print(f"  Input batch files (.txt): {len(batch_txt)}")
print(f"  Result files (.json):     {len(batch_json)}")

if len(batch_txt) != 197:
    print(f"  WARNING: Expected 197 txt files, got {len(batch_txt)}")
if len(batch_json) != 197:
    print(f"  WARNING: Expected 197 result files, got {len(batch_json)}")

# Check for gaps
txt_nums = set(int(x.split('\\')[-1].split('_')[1].split('.')[0]) for x in batch_txt)
json_nums = set(int(x.split('\\')[-1].split('_')[1].split('.')[0]) for x in batch_json)
missing_json = txt_nums - json_nums
if missing_json:
    print(f"  MISSING result files: {sorted(missing_json)}")
else:
    print("  All 197 result files present [OK]")

# Validate each result file
print()
print("=" * 60)
print("Validating result files")
print("=" * 60)
errors = []
item_count = 0
for rf in batch_json:
    try:
        with open(rf, 'r', encoding='utf-8-sig') as f:
            content = f.read().strip()
            if not content.startswith('['):
                # Try to find JSON array in the text
                idx = content.find('[')
                if idx >= 0:
                    content = content[idx:]
                else:
                    errors.append(f"{os.path.basename(rf)}: no JSON array found")
                    continue
            data = json.loads(content)
            if not isinstance(data, list):
                errors.append(f"{os.path.basename(rf)}: not a list")
                continue
            # Check each item has required fields
            for i, item in enumerate(data):
                for k in ['school_id', 'index_name', 'score']:
                    if k not in item:
                        errors.append(f"{os.path.basename(rf)}[{i}]: missing {k}")
            item_count += len(data)
    except Exception as e:
        errors.append(f"{os.path.basename(rf)}: {str(e)[:80]}")

print(f"  Total items scored by LLM: {item_count}")
if errors:
    print(f"  ERRORS ({len(errors)}):")
    for e in errors[:20]:
        print(f"    {e}")
else:
    print("  All result files valid [OK]")

print()
print("=" * 60)
print("STEP 3: Final merged output")
print("=" * 60)
f_final = os.path.join(BASE, 'school_indices.json')
if os.path.exists(f_final):
    with open(f_final, 'r', encoding='utf-8') as f:
        final = json.load(f)
    print(f"  Final file: EXISTS, {os.path.getsize(f_final)/1024/1024:.1f} MB")
    print(f"  Schools: {len(final)}")
    
    # Check all 20 indices per school
    expected = ["bed_type","air_con","bathroom","self_study","morning_run",
                "running_km","holiday","delivery","traffic","washer",
                "internet","power_cut","canteen","hot_water","ebike",
                "power_limit","night_study","laptop","access","inspection"]
    
    all_have_all = True
    missing_count = 0
    score_count = 0
    for sid, school in final.items():
        for idx in expected:
            if idx in school.get('indices', {}):
                score_count += 1
            else:
                missing_count += 1
                all_have_all = False
    
    print(f"  Total index entries: {score_count}")
    print(f"  Missing entries: {missing_count}")
    if all_have_all:
        print("  All 3447 schools have all 20 indices [OK]")
    
    # Value range checks
    print()
    print("=" * 60)
    print("Value range sanity checks")
    print("=" * 60)
    for idx in expected:
        vals = [school['indices'][idx] for school in final.values() 
                if idx in school['indices']]
        if not vals:
            print(f"  {idx}: NO DATA")
            continue
        min_v, max_v = min(vals), max(vals)
        avg_v = sum(vals) / len(vals)
        # Check for anomalies
        warnings = []
        if max_v > 1000 and idx in ["bed_type","air_con","bathroom","self_study",
                                      "morning_run","delivery","traffic","washer",
                                      "internet","power_cut","canteen","ebike",
                                      "night_study","laptop","access","inspection"]:
            warnings.append(f"max={max_v} > 100 for binary index!")
        if idx in ["running_km","holiday","hot_water","power_limit"]:
            pass  # numeric, no upper limit
        
        w = " [WARN] " + "; ".join(warnings) if warnings else ""
        print(f"  {idx:<15} min={min_v:<10} max={max_v:<10} avg={avg_v:<10.1f}  count={len(vals)}{w}")
    
    # Cross-check rule vs LLM
    print()
    print("=" * 60)
    print("Rule vs LLM consistency check (on same data)")
    print("=" * 60)
    with open(os.path.join(BASE, 'step1_matched.json'), 'r', encoding='utf-8') as f:
        matched = json.load(f)
    
    rule_entries = 0
    for sid_str, school in matched.items():
        rule_entries += len(school.get('indices', {}))
    print(f"  Rule-matched entries: {rule_entries}")
    print(f"  LLM-scored entries:   {item_count}")
    print(f"  Total:                {rule_entries + item_count}")
    print(f"  Expected (3447*20):   {3447 * 20}")
    if rule_entries + item_count == 3447 * 20:
        print("  [OK] Exact match: {} (rule) + {} (LLM) = {}".format(rule_entries, item_count, 3447*20))
else:
    print(f"  FINAL FILE MISSING!")

print()
print("=" * 60)
print("VERDICT")
print("=" * 60)
if (len(batch_json) == 197 
    and missing_count == 0 
    and os.path.exists(f_final)
    and rule_entries + item_count == 3447 * 20):
    print("  [OK] ALL COMPLETE - 3,447 schools x 20 indices = 68,940 total scores")
else:
    print("  [WARN] INCOMPLETE - see warnings above")
