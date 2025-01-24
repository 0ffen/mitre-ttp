from openai import OpenAI
import json
import time
import sys
import dotenv
import math

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


def upload_batch_input():
    batch_input_file = client.files.create(
        file=open("../tmp/batchinput.jsonl", "rb"), purpose="batch"
    )

    return batch_input_file.id


def batch_query_openai(id: str):
    response = client.batches.create(
        input_file_id=id,
        endpoint="/v1/chat/completions",
        completion_window="24h",
        metadata={"model": "gpt-4o-mini", "lang": lang},
    )

    return response


def get_running_batch_id():
    batches = client.batches.list()

    for batch in batches:
        if batch.metadata == None or "lang" not in batch.metadata:
            continue

        if batch.metadata["lang"] == lang and batch.status == "in_progress":
            return batch.id

    return None


def subscribe_to_batch(id: str):
    try_count = 1

    def get_batch(id: str, count: int = 1):
        response = client.batches.retrieve(id)

        print(
            f"{count}. [{math.floor(time.time() - response.created_at)}s] Status: {response.status} | Progress: {response.request_counts.completed + response.request_counts.failed}/{response.request_counts.total} | Failed: {response.request_counts.failed}"
        )

        return response

    response = get_batch(id, try_count)
    while response.status != "completed":
        time.sleep(10)

        try_count += 1
        response = get_batch(id, try_count)

    return response


def create_query(id: str, query: str):
    return {
        "custom_id": id,
        "method": "POST",
        "url": "/v1/chat/completions",
        "body": {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": f"This description is about Cyber Kill Chain steps made by mitre attack. Translate next description in {lang} for penetration testing report.",
                },
                {"role": "user", "content": query},
            ],
            "max_tokens": 1000,
        },
    }


def read_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
        return data


def write_json_file(file_path, content):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(content, file, ensure_ascii=False, indent=2)


def main():
    running_batch_id = get_running_batch_id()

    if not running_batch_id:
        datas = read_json_file("../tmp/objects.json")

        objects = ""

        for i, data in enumerate(datas):
            print(f"Processing {i + 1}th data... Length: {len(datas)}")
            if "translated" in data and data["translated"]:
                continue
            objects += json.dumps(
                create_query(data["external_id"], data["description"])
            )
            objects += "\n"

        with open("../tmp/batchinput.jsonl", "w") as file:
            file.write(objects)

        batch_input_id = upload_batch_input()
        print(f"Batch input ID: {batch_input_id}")

        running_batch_id = batch_query_openai(batch_input_id).id

        print(f"Batch ID: {running_batch_id}")
    else:
        print(f"Found running batch: {running_batch_id}")

    success_response = subscribe_to_batch(running_batch_id)
    results = client.files.content(success_response.output_file_id).text

    for i, result in enumerate(results.split("\n")):
        if result == "":
            continue
        data = json.loads(result)
        datas[i]["translated"] = True
        datas[i]["description"] = data["response"]["body"]["choices"][0]["message"][
            "content"
        ]

    write_json_file("../tmp/translated.json", datas)


if __name__ == "__main__":
    main()
