import fs from "fs";
import path from "path";

import { tempPath } from "./utils/temp";
import { translatePath } from "./translate";

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

export interface ExternalReference {
  external_id?: string;
  url: string;
  description?: string;
  source_name: string;
}

export interface XMitreTactic {
  x_mitre_domains: string[];
  object_marking_refs: string[];
  id: string;
  type: "x-mitre-tactic";
  created: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  modified: string;
  name: string;
  description: string;
  x_mitre_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_modified_by_ref: string;
  x_mitre_shortname: string;
}

export interface AttackPattern {
  x_mitre_platforms: string[];
  x_mitre_domains: string[];
  object_marking_refs: string[];
  id: string;
  type: "attack-pattern";
  created: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  modified: string;
  name: string;
  description: string;
  kill_chain_phases: KillChainPhase[];
  x_mitre_detection: string;
  x_mitre_is_subtechnique: boolean;
  x_mitre_version: string;
  x_mitre_modified_by_ref: string;
  x_mitre_data_sources: string[];
  x_mitre_defense_bypassed: string[];
}

export interface KillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}

function parseRaw(data: RawTTP): Parsed {
  if (data.type === "x-mitre-tactic") {
    return {
      type: "tactic",
      title: data.name,
      description: data.description,
      external_id: data.external_references[0].external_id!,
      modified: data.modified,
    };
  } else {
    return {
      type: "technique",
      title: data.name,
      description: data.description,
      external_id: data.external_references[0].external_id!,
      modified: data.modified,
    };
  }
}

function parseIfExists<T>(path: string, defaultValue: T): T {
  if (!fs.existsSync(path)) return defaultValue;
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

function external_id(data: RawTTP): string {
  return data.external_references[0].external_id!;
}

export default function (lang: string) {
  console.log(`Generating ${lang}...`);
  const raw$old_data = parseIfExists<{
    tactics: Parsed[];
    techniques: Parsed[];
  }>(path.join(translatePath, `${lang}.json`), { tactics: [], techniques: [] });
  const old_data = [...raw$old_data.tactics, ...raw$old_data.techniques];
  const new_data = parseIfExists<{ objects: RawTTP[] } | null>(
    path.resolve(tempPath, "enterprise-attack.json"),
    null
  );
  if (old_data.length === 0) console.warn(`Language ${lang} not found`);
  if (new_data === null) throw new Error("enterprise-attack.json not found");

  const result: Parsed[] = [];
  const new_objects = new_data.objects.filter((o) =>
    ["x-mitre-tactic", "attack-pattern"].includes(o.type)
  );
  const tactics = new_objects.filter((o) => o.type === "x-mitre-tactic");

  for (const new_object of new_objects) {
    const old_object = old_data.find(
      (o) => o.external_id === external_id(new_object)
    );

    if (old_object && old_object.modified === new_object.modified) {
      result.push({
        ...old_object,
        translated: true,
      });
    } else if (new_object.type === "attack-pattern") {
      const __kill_chain_phase_names = new_object.kill_chain_phases.map(
        (k) => k.phase_name
      );
      const ref$tactics = tactics.filter((t) =>
        __kill_chain_phase_names.includes(t.x_mitre_shortname)
      );
      result.push({
        ...parseRaw(new_object),
        tactics: ref$tactics.map(external_id),
      });
    } else {
      result.push(parseRaw(new_object));
    }
  }
  fs.writeFileSync(
    path.resolve(tempPath, "objects.json"),
    JSON.stringify(result, null, 2)
  );

  const count = result.filter((r) => !r.translated).length;
  console.log(`Need to translate ${count} objects`);
}
