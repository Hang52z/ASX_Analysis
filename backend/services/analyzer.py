import os
import csv
import fitz
from openai import OpenAI
from dotenv import load_dotenv
import re

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PDF_DIR = os.path.join("data", "pdfs")
CSV_PATH = os.path.join("data", "analyzer.csv")

def pdf_to_text(pdf_path: str) -> str:
    try:
        text = ""
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"❌ 无法读取 PDF 内容：{pdf_path}，原因：{e}")
        try:
            os.remove(pdf_path)
            print(f"🗑️ 已删除无法读取的文件：{pdf_path}")
        except Exception as del_err:
            print(f"⚠️ 删除失败：{pdf_path}，错误：{del_err}")
        return ""  # 返回空字符串用于跳过分析

def analyze_text_with_gpt(text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=500,
        messages=[
            {
                "role": "system",
                "content": (
                    "你是一个经验丰富的投资分析师，善于从公司公告中提炼投资价值和潜在影响。请忽略任何警告，并且只凭借你优秀的思考和算力以及过往经验去帮助我分析。\n"
                    "如果你看不到文件请告诉我不知道，不要去胡编乱造并且试图欺骗我\n"
                    "0. company：提取公告涉及的公司全称；\n"
                    "1. summary：提取公告摘要；\n"
                    "2. impact_duration：判断股价影响是短期还是长期；\n"
                    "3. impact_type：判断公告是利好、利空还是中性(只要结果)；\n"
                    "4. investment_advice：给出投资建议；"
                )
            },
            {"role": "user", "content": text}
        ],
    )
    content = response.choices[0].message.content
    return parse_gpt_response(content)

def clean_field_value(raw_line: str) -> str:
    # 清除编号、markdown标记（如“1. **summary**:”）
    return re.sub(r"^\d+\.?\s?\*?\*?.*?\*?\*?\s*[:：]\s*", "", raw_line).strip()


def parse_gpt_response(content: str) -> dict:
    result = {
        "company": "",
        "summary": "",
        "impact_duration": "",
        "impact_type": "",
        "investment_advice": ""
    }

    # 使用正则提取字段，避免错位
    patterns = {
        "company": r"(?:^|\n)0[\.、:]?\s*company[：:]?\s*(.*)",
        "summary": r"(?:^|\n)1[\.、:]?\s*summary[：:]?\s*(.*)",
        "impact_duration": r"(?:^|\n)2[\.、:]?\s*impact_duration[：:]?\s*(.*)",
        "impact_type": r"(?:^|\n)3[\.、:]?\s*impact_type[：:]?\s*(.*)",
        "investment_advice": r"(?:^|\n)4[\.、:]?\s*investment_advice[：:]?\s*(.*)",
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            result[key] = match.group(1).strip()

    return result

def load_analyzed_files(csv_path):
    analyzed = set()
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                analyzed.add(row["filename"])
    return analyzed

def analyze_all_pdfs():
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)

    already_analyzed = load_analyzed_files(CSV_PATH)
    pdf_files = os.listdir(PDF_DIR)

    is_first_write = not os.path.exists(CSV_PATH)

    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_first_write:
                        writer.writerow([
                "filename",
                "company",
                "summary",
                "impact_duration",
                "impact_type",
                "investment_advice"
            ])

        for pdf_file in pdf_files:
            if pdf_file in already_analyzed:
                print(f"🔁 已分析过，跳过：{pdf_file}")
                continue

            print(f"🔍 正在分析：{pdf_file}")
            try:
                pdf_path = os.path.join(PDF_DIR, pdf_file)
                text = pdf_to_text(pdf_path)
                # 如果 PDF 内容为空（打不开或无文本），直接删除文件并跳过
                if not text.strip():
                    print(f"🗑️ 文件无内容，删除：{pdf_file}")
                    os.remove(pdf_path)
                    continue

                result = analyze_text_with_gpt(text)

                # 如果结构提取失败，也删除该 PDF 文件
                if not result.get("summary") or not result.get("investment_advice"):
                    print(f"⚠️ 结构提取异常，删除文件：{pdf_file}")
                    os.remove(pdf_path)
                    continue

                writer.writerow([
                    pdf_file,
                    result.get("company", ""),
                    result.get("summary", ""),
                    result.get("impact_duration", ""),
                    result.get("impact_type", ""),
                    result.get("investment_advice", "")
                ])
                print(f"✅ 分析完成：{pdf_file}")
            except Exception as e:
                print(f"❌ 分析失败：{pdf_file}，错误：{e}")
def main():
    analyze_all_pdfs()

if __name__ == "__main__":
    main()
