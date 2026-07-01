"""Clean up anomalous values before final output"""
import json

SRC = r'D:\BIAN\UIG\pipeline_output\school_indices.json'
DST = r'D:\BIAN\UIG\pipeline_output\school_indices.json'

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reasonable caps per index
CAPS = {
    'running_km': 300,
    'holiday': 180,
    'hot_water': 24,
    'power_limit': 9999,
}

fixed_count = 0
for sid, school in data.items():
    for idx, cap in CAPS.items():
        if idx in school['indices']:
            val = school['indices'][idx]
            if val is not None and val > cap:
                school['indices'][idx] = cap
                fixed_count += 1

with open(DST, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Cleaned {fixed_count} out-of-range values")
print(f"Saved to {DST}")

# Verify
with open(DST, 'r', encoding='utf-8') as f:
    data = json.load(f)

for idx, cap in CAPS.items():
    vals = [s['indices'][idx] for s in data.values() if idx in s['indices']]
    print(f"{idx}: max={max(vals)}, min={min(vals)}, any > cap={any(v > cap for v in vals)}")
