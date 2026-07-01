import json, os, math

FAQ_PATH = r'D:\BIAN\UIG\university-helper\data\faq.json'
OUT_DIR = r'D:\BIAN\UIG\pipeline_output\running_batches'
os.makedirs(OUT_DIR, exist_ok=True)

with open(FAQ_PATH, 'r', encoding='utf-8') as f:
    faq = json.load(f)

BATCH_SIZE = 100
batches = []
current_batch = []

for sid, school in enumerate(faq):
    has_running = False
    running_answers = []
    for qa in school.get('answers', []):
        if qa.get('question_short') == '跑步打卡':
            has_running = True
            running_answers = [a['answer'] for a in qa.get('answers', [])]
            break
    
    entry = {
        'sid': sid,
        'name': school['name'],
        'running_answers': running_answers if has_running else [],
        'has_faq': has_running
    }
    
    current_batch.append(entry)
    
    if len(current_batch) >= BATCH_SIZE:
        batches.append(current_batch)
        current_batch = []

if current_batch:
    batches.append(current_batch)

print(f"总共 {len(faq)} 所学校, 分为 {len(batches)} 批 (每批 ~{BATCH_SIZE} 所)")

for i, batch in enumerate(batches):
    filepath = os.path.join(OUT_DIR, f'batch_{i:03d}.json')
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)
    has_running = sum(1 for s in batch if s['has_faq'])
    print(f"  batch_{i:03d}.json: {len(batch)} 所学校, {has_running} 所有跑步FAQ")
