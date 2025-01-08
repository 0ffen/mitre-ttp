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

export default async function (lang: string) {
  runTranslate(lang);
  fs.writeFileSync(
    path.resolve(translatePath, `${lang}.json`),
    JSON.stringify(
      sort(JSON.parse(fs.readFileSync(outputPath, "utf-8")), "external_id"),
      null,
      2
    )
  );
}
