import fs from "fs";
import path from "path";

import { tempPath } from "./utils/temp.js";

export const versionPath = path.resolve(tempPath, "version");
export const remoteTTPUrl =
  "https://raw.githubusercontent.com/mitre/cti/refs/heads/master/enterprise-attack/enterprise-attack.json";

export default async function () {
  const oldVersion = fs.existsSync(versionPath)
    ? fs.readFileSync(versionPath, "utf-8")
    : "";
  const data = await fetch(remoteTTPUrl).then((res) => res.json());
  const version = data.id;
  if (oldVersion === version) {
    console.log("No update");
    return;
  }
  console.log(`Update detected ${oldVersion} -> ${version}`);

  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true });
  }
  fs.mkdirSync(tempPath, { recursive: true });

  fs.writeFileSync(
    path.resolve(tempPath, "enterprise-attack.json"),
    JSON.stringify(data, null, 2)
  );

  fs.writeFileSync(versionPath, version);
}
