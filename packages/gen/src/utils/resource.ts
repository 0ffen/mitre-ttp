import TTPDatabase from "@0ffen/mitre-ttp";

export interface ExternalReference {
  external_id?: string;
  url: string;
  description?: string;
  source_name: string;
}

export interface KillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}

export interface SimplifiedObject {
  modified: string;
  title: string;
  description: string;
  external_id: string;
  translated?: boolean;
}

export interface Object {
  object_marking_refs: string[];
  id: string;
  type: string;
  created: string;
  created_by_ref: string;
  external_references: ExternalReference[];
  modified: string;
  name: string;
  description: string;
}

export interface XMitreTactic extends Object {
  x_mitre_domains: string[];
  type: "x-mitre-tactic";
  x_mitre_version: string;
  x_mitre_attack_spec_version: string;
  x_mitre_modified_by_ref: string;
  x_mitre_shortname: string;
}

export interface AttackPattern extends Object {
  x_mitre_platforms: string[];
  x_mitre_domains: string[];
  type: "attack-pattern";
  kill_chain_phases: KillChainPhase[];
  x_mitre_detection: string;
  x_mitre_is_subtechnique: boolean;
  x_mitre_version: string;
  x_mitre_modified_by_ref: string;
  x_mitre_data_sources: string[];
  x_mitre_defense_bypassed: string[];
}

export function simplifyObject(obj: Object): SimplifiedObject {
  return {
    modified: obj.modified,
    title: obj.name,
    description: obj.description,
    external_id: obj.id,
  };
}

export class ResourcesWrapper implements Iterable<SimplifiedObject> {
  private tactics: SimplifiedObject[];
  private techniques: SimplifiedObject[];
  private tacticTechniqueRelation: Record<string, string[]>;

  constructor(
    tactics: SimplifiedObject[],
    techniques: SimplifiedObject[],
    tacticTechniqueRelation: Record<string, string[]>
  );
  constructor(
    data: Object[] | SimplifiedObject[],
    techniques: SimplifiedObject[],
    tacticTechniqueRelation: Record<string, string[]>
  ) {
    this.tactics = data as SimplifiedObject[];
    this.techniques = techniques;
    this.tacticTechniqueRelation = tacticTechniqueRelation;
  }

  [Symbol.iterator](): Iterator<SimplifiedObject> {
    let index = 0;
    const data = [...this.tactics, ...this.techniques];
    return {
      next(): IteratorResult<SimplifiedObject> {
        if (index < data.length) {
          return {
            done: false,
            value: data[index++],
          };
        } else {
          return {
            done: true,
            value: null,
          };
        }
      },
    };
  }

  static fromDatabase(db: TTPDatabase): ResourcesWrapper {
    const tactics = db.findAllTactics();
    const techniques = db.findAllTechniques();
    const relations = tactics.reduce((acc: any, cur: any) => {
      acc[cur.external_id] = db
        .findAllTechniquesByTacticId(cur.external_id)
        .map((t) => t.external_id);
      return acc;
    }, {});
    return new ResourcesWrapper(tactics, techniques, relations);
  }

  static fromRawObjects(data: Object[]): ResourcesWrapper {
    const tactics = data
      .filter((d) => d.type === "x-mitre-tactic")
      .map(simplifyObject);
    const techniques = data
      .filter((d) => d.type === "attack-pattern")
      .map(simplifyObject);
    const relations = techniques.reduce((acc: any, cur: any) => {
      cur.kill_chain_phases.forEach((phase: KillChainPhase) => {
        if (!acc[phase.phase_name]) acc[phase.phase_name] = [];
        acc[phase.phase_name].push(cur.external_id);
      });
      return acc;
    }, {});
    return new ResourcesWrapper(tactics, techniques, relations);
  }

  public findByExternalId(externalId: string): SimplifiedObject | undefined {
    if (externalId.startsWith("TA")) {
      return this.tactics.find((t) => t.external_id === externalId);
    }
    return this.techniques.find((t) => t.external_id === externalId);
  }

  public findTacticByExternalId(
    externalId: string
  ): SimplifiedObject | undefined {
    return this.tactics.find((t) => t.external_id === externalId);
  }

  public findTacticsByTechniqueId(techniqueId: string): SimplifiedObject[] {
    const technique = this.findByExternalId(techniqueId);
    if (!technique) {
      return [];
    }
    const tactics = this.tactics.filter((tactic) =>
      this.tacticTechniqueRelation[tactic.external_id].includes(
        technique.external_id
      )
    );
    return tactics;
  }

  public findTechniqueByExternalId(
    externalId: string
  ): SimplifiedObject | undefined {
    return this.techniques.find((t) => t.external_id === externalId);
  }

  public findTechniquesByTacticId(tacticId: string): SimplifiedObject[] {
    const tactic = this.findByExternalId(tacticId);
    if (!tactic) {
      return [];
    }
    return this.tacticTechniqueRelation[tactic.external_id].map(
      (id) => this.findTechniqueByExternalId(id)!
    );
  }
}
