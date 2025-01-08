import fs from "fs";
import path from "path";
import arg from "arg";
import { exec, execSync } from "child_process";

// 현재 파일 위치 기준
const pythonPath = path.resolve(import.meta.dirname, "../utils/translate.py");
const outputPath = path.resolve(import.meta.dirname, "../tmp/translated.json");

// 실행 위치 기준으로 번역 결과를 저장
export const translatePath = path.resolve("translate");

const runTranslate = (lang) => {
  console.log("Translating...");
  execSync(`python ${pythonPath} ${lang}`, {
    stdio: "inherit",
    cwd: path.dirname(pythonPath),
  });
  console.log("Translation done");
};

const readOutput = () =>
  import(outputPath, { with: { type: "json" } }).then((m) => m.default);

export default async function (lang) {
  runTranslate(lang);
  fs.renameSync(outputPath, path.resolve(translatePath, `${lang}.json`));

  // // 번역된 결과 읽기
  // const output = await readOutput();

  // // 번역 대상 언어 디렉토리 생성
  // if (!fs.existsSync(path.resolve(translatePath, lang)))
  //   fs.mkdirSync(path.resolve(translatePath, lang), { recursive: true });

  // // 번역된 결과 파일로 저장
  // for (const ttp of output) {
  //   const file = path.resolve(translatePath, lang, `${ttp.external_id}`);
  //   console.log(`Writing ${file}`);
  //   fs.writeFileSync(file, ttp.description);
  // }
}
