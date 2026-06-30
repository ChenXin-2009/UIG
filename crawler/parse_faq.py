"""
爬虫3：解析 CollegesChat FAQ 数据
来源：GitHub - CollegesChat/university-information (generated 分支)
策略：git clone 后解析 docs/universities/*.md 文件
"""
import json
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
FAQ_REPO_URL = "https://github.com/CollegesChat/university-information.git"
FAQ_DIR = os.path.join(DATA_DIR, "faq_repo")

QUESTIONS = [
    ("Q: 宿舍是上床下桌吗", "上床下桌"),
    ("Q: 教室和宿舍有没有空调", "空调"),
    ("Q: 有独立卫浴吗", "独立卫浴"),
    ("Q: 有早自习、晚自习吗", "早晚自习"),
    ("Q: 有晨跑吗", "晨跑"),
    ("Q: 每学期跑步打卡的要求是多少公里", "跑步打卡"),
    ("Q: 寒暑假放多久", "寒暑假"),
    ("Q: 学校允许点外卖吗", "外卖"),
    ("Q: 学校交通便利吗，有地铁吗", "交通"),
    ("Q: 宿舍楼有洗衣机吗", "洗衣机"),
    ("Q: 校园网怎么样", "校园网"),
    ("Q: 每天断电断网吗", "断电断网"),
    ("Q: 食堂价格贵吗", "食堂"),
    ("Q: 洗澡热水供应时间", "热水"),
    ("Q: 校园内可以骑电瓶车吗", "电瓶车"),
    ("Q: 宿舍限电情况", "限电"),
    ("Q: 通宵自习有去处吗", "通宵自习"),
    ("Q: 大一能带电脑吗", "带电脑"),
    ("Q: 学校里面用什么卡", "校园卡"),
    ("Q: 学校会给学生发银行卡吗", "银行卡"),
    ("Q: 学校的超市怎么样", "超市"),
    ("Q: 学校的收发快递政策怎么样", "快递"),
    ("Q: 学校里面的共享单车数目与种类如何", "共享单车"),
    ("Q: 现阶段学校的门禁情况如何", "门禁"),
    ("Q: 宿舍晚上查寝吗，封寝吗，晚归能回去吗", "查寝"),
]


def ensure_faq_repo():
    """克隆或更新 FAQ repo"""
    if os.path.exists(FAQ_DIR):
        print("[FAQ] 仓库已存在，执行 git pull...")
        subprocess.run(
            ["git", "-C", FAQ_DIR, "pull", "--ff-only"],
            capture_output=True, timeout=60,
        )
    else:
        print("[FAQ] 克隆仓库...")
        subprocess.run(
            ["git", "clone", "--depth=1", "-b", "generated", FAQ_REPO_URL, FAQ_DIR],
            capture_output=True, timeout=120,
        )


def parse_school_md(filepath):
    """解析单个学校的 FAQ markdown 文件"""
    filename = os.path.basename(filepath)
    school_id = filename.replace(".md", "")
    school_name_cn = school_id.replace("-", "")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    name_match = re.search(r'^#\s+(.+)', content)
    school_name = name_match.group(1).strip() if name_match else school_name_cn

    result = {
        "id": school_id,
        "name": school_name,
        "answers": [],
    }

    for question_text, short_name in QUESTIONS:
        # Find the Q section
        q_pattern = re.escape(question_text)
        q_section = re.search(
            rf'##\s*{q_pattern}.*?(?=##\s*Q:|\Z)',
            content, re.DOTALL
        )
        if not q_section:
            continue

        section_text = q_section.group(0)

        # Parse individual answers (lines starting with - Axxxxx: or - Axxxxx@...:)
        answers = []
        for line in section_text.split("\n"):
            line = line.strip()
            if line.startswith("- "):
                # Extract user info and answer
                match = re.match(r'^- ([ATUY]\d+).*?:\s*(.+)', line)
                if match:
                    user_id = match.group(1)
                    answer = match.group(2).strip()
                    # Extract year from user if available
                    year_match = re.search(r'(\d{4})\s*年', line)
                    year = int(year_match.group(1)) if year_match else 0
                    answers.append({
                        "user": user_id,
                        "year": year,
                        "answer": answer,
                    })

        if answers:
            result["answers"].append({
                "question": question_text.replace("Q: ", ""),
                "question_short": short_name,
                "answers": answers,
            })

    return result


def crawl():
    ensure_faq_repo()

    universities_dir = os.path.join(FAQ_DIR, "docs", "universities")
    if not os.path.exists(universities_dir):
        print("[FAQ] 未找到 universities 目录")
        return

    files = sorted([
        os.path.join(universities_dir, f)
        for f in os.listdir(universities_dir)
        if f.endswith(".md")
    ])
    print(f"[FAQ] 找到 {len(files)} 个学校文件")

    results = []
    errors = 0

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(parse_school_md, f): f for f in files}
        for future in tqdm(as_completed(futures), total=len(futures)):
            try:
                result = future.result()
                if result:
                    results.append(result)
            except Exception:
                errors += 1

    results.sort(key=lambda x: x["id"])
    print(f"[FAQ] 成功: {len(results)}, 失败: {errors}")

    output_path = os.path.join(DATA_DIR, "faq.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[FAQ] 已保存到 {output_path}")
    return results


if __name__ == "__main__":
    crawl()
