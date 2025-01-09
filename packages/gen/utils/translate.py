from openai import OpenAI
import json
import time
import sys
import dotenv
import os

config = dotenv.dotenv_values(dotenv.find_dotenv())
prompts = json.load(open("../prompt.json"))

client = OpenAI(
    organization=config["OPENAI_ORG"],
    project=config["OPENAI_PROJECT"],
    api_key=config["OPENAI_API_KEY"],
)

lang = sys.argv[1] if len(sys.argv) > 1 else None

if lang == None:
    print("Please provide the language code.")
    sys.exit(1)
if lang not in prompts:
    print("Invalid language code.")
    sys.exit(1)


def query_openai(query: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": prompts[lang],
            },
            {"role": "user", "content": query},
        ],
    )

    return response.choices[0].message


def read_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
        return data


def write_json_file(file_path, content):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(content, file, ensure_ascii=False, indent=2)


def main():
    datas = read_json_file("../tmp/objects.json")

    for i, data in enumerate(datas):
        print(f"Processing {i + 1}th data... Length: {len(datas)}")
        if "translated" in data and data["translated"]:
            continue
        start_time = time.time()
        output = query_openai(data["description"]).content
        end_time = time.time()
        print("processed time: ", end_time - start_time)
        data["description"] = output
        data["translated"] = True
        write_json_file("../tmp/translated.json", datas)

    write_json_file("../tmp/translated.json", datas)


if __name__ == "__main__":
    main()
