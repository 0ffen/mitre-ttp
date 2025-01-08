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

export default async function (lang: string) {
  runTranslate(lang);
  fs.renameSync(outputPath, path.resolve(translatePath, `${lang}.json`));
}
