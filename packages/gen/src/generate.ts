import fs from "fs";
import path from "path";

import { tempPath } from "./utils/temp";
import { translatePath } from "./translate";
import {
  AttackPattern,
  ResourcesWrapper,
  SimplifiedObject,
  simplifyObject,
  XMitreTactic,
} from "./utils/resource";
import TTPDatabase from "@0ffen/mitre-ttp";
import { LanguageCode } from "./utils/lang";

export type RawTTP = XMitreTactic | AttackPattern;
export type Parsed = {
  type: "tactic" | "technique";
  title: string;
  description: string;
  external_id: string;
  modified: string;
  translated?: boolean;
  tactics?: string[];
};

function external_id(obj: RawTTP) {
  return obj.external_references[0].external_id!;
}

function parseIfExists<T>(path: string): T;
function parseIfExists<T>(path: string, defaultValue: T): T;
function parseIfExists<T>(path: string, defaultValue?: T): T {
  if (!fs.existsSync(path))
    if (defaultValue) return defaultValue;
    else throw new Error(`${path} not found`);
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export default function (lang: LanguageCode) {
  console.log(`Generating ${lang}...`);

  if (!TTPDatabase.hasLanguage(lang))
    console.warn(`Language ${lang} not found`);
  const old_data = TTPDatabase.hasLanguage(lang)
    ? ResourcesWrapper.fromDatabase(new TTPDatabase(lang))
    : new ResourcesWrapper([], [], {});
  const new_data = parseIfExists<{ objects: RawTTP[] }>(
    path.resolve(tempPath, "enterprise-attack.json")
  ).objects.filter((o) =>
    ["x-mitre-tactic", "attack-pattern"].includes(o.type)
  );

  const result: (SimplifiedObject & { tactics?: string[] })[] = [];
  const tactics = new_data.filter((o) => o.type === "x-mitre-tactic");

  for (const new_object of new_data) {
    const old_object = old_data.findByExternalId(external_id(new_object));

    if (old_object && old_object.modified === new_object.modified) {
      result.push(old_object);
    } else if (new_object.type === "attack-pattern") {
      const __kill_chain_phase_names = new_object.kill_chain_phases.map(
        (k) => k.phase_name
      );
      const ref$tactics = tactics.filter((t) =>
        __kill_chain_phase_names.includes(t.x_mitre_shortname)
      );
      result.push({
        ...simplifyObject(new_object),
        tactics: ref$tactics.map(external_id),
      });
    } else {
      result.push(simplifyObject(new_object));
    }
  }
  fs.writeFileSync(
    path.resolve(tempPath, "objects.json"),
    JSON.stringify(result, null, 2)
  );

  const count = result.filter((r) => !r.translated).length;
  console.log(`Need to translate ${count} objects`);
}
