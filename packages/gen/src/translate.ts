import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 현재 파일 위치 기준
const pythonPath = path.resolve(__dirname, "../utils/translate.py");
const outputPath = path.resolve(__dirname, "../tmp/translated.json");

// 실행 위치 기준으로 번역 결과를 저장
export const translatePath = path.resolve("translate");

const runTranslate = (lang: string) => {
  console.log("Translating...");
  execSync(`python ${pythonPath} ${lang}`, {
    stdio: "inherit",
    cwd: path.dirname(pythonPath),
  });
  console.log("Translation done");
};

const objectify = (data: any[], keyProperty: string) =>
  data.reduce((acc, cur) => {
    acc[cur[keyProperty]] = cur;
    return acc;
  }, {});

const sort = (data: any[], keyProperty: string) =>
  data.sort((a, b) => {
    if (a[keyProperty] < b[keyProperty]) return -1;
    if (a[keyProperty] > b[keyProperty]) return 1;
    return 0;
  });

const deleteKeys = (data: any[], keys: string[]) =>
  data.map((d) => {
    keys.forEach((key) => delete d[key]);
    return d;
  });

const replacer = (key: string, value: any) =>
  value instanceof Object && !(value instanceof Array)
    ? Object.keys(value)
        .sort()
        .reduce((sorted: any, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {})
    : value;

export default async function (lang: string) {
  runTranslate(lang);
  const data = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  const tactics = data.filter((d: any) => d.type === "tactic");
  const techniques = data.filter((d: any) => d.type === "technique");
  const tacticTechniqueJoin = techniques.reduce((acc: any, cur: any) => {
    cur.tactics.forEach((tactic: string) => {
      if (!acc[tactic]) acc[tactic] = [];
      acc[tactic].push(cur.external_id);
    });
    return acc;
  }, {});
  fs.writeFileSync(
    path.resolve(translatePath, `${lang}.json`),
    JSON.stringify(
      {
        tactics: deleteKeys(sort(tactics, "external_id"), ["type"]),
        techniques: deleteKeys(sort(techniques, "external_id"), [
          "type",
          "tactics",
        ]),
        tactic_technique: tacticTechniqueJoin,
      },
      replacer,
      2
    )
  );
}
