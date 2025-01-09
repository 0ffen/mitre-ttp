import fs from "fs";
import path from "path";
import { LanguageCode } from "./lang";

interface TTP {
  title: string;
  description: string;
  external_id: string;
  modified: string;
  translated?: boolean;
}

interface Tactic extends TTP {
  techniques?: Technique[];
}

interface Technique extends TTP {}

function binarySearch<T>(
  arr: T[],
  target: string,
  key: keyof T
): T | undefined {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    if (arr[mid][key] === target) {
      return arr[mid];
    } else if (arr[mid][key] < target) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return undefined;
}

function upperBound<T>(arr: T[], target: string, key: keyof T): number {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    if (arr[mid][key] <= target) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return start;
}

function lowerBound<T>(arr: T[], target: string, key: keyof T): number {
  let start = 0;
  let end = arr.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    if (arr[mid][key] < target) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  return start;
}

export default class TTPDatabase {
  private tactics: Tactic[] = [];
  private techniques: Technique[] = [];
  private tacticTechniqueRefs: Record<string, Technique[]> = {};

  constructor(private lang: LanguageCode) {
    const data = JSON.parse(
      fs.readFileSync(
        path.resolve(`${__dirname}/../translate/${lang}.json`),
        "utf-8"
      )
    );
    this.tactics = data.tactics;
    this.techniques = data.techniques;
    this.tacticTechniqueRefs = Object.fromEntries(
      Object.entries(data.tactic_technique as Record<string, string[]>).map(
        ([tacticId, techniqueIds]) => {
          return [
            tacticId,
            techniqueIds.map(
              (techniqueId: string) => this.findOneByExternalId(techniqueId)!
            ),
          ];
        }
      )
    );
  }

  static hasLanguage(lang: LanguageCode): boolean {
    return fs.existsSync(
      path.resolve(`${__dirname}/../translate/${lang}.json`)
    );
  }

  public findOneByExternalId(externalId: string): TTP | undefined {
    if (externalId.startsWith("TA")) {
      return binarySearch(this.tactics, externalId, "external_id");
    }
    return binarySearch(this.techniques, externalId, "external_id");
  }

  public findAllTechniques(): Technique[] {
    return this.techniques;
  }

  public findAllTechniquesByTacticId(tacticId: string): Technique[] {
    const tactic = this.findOneByExternalId(tacticId);
    if (!tactic) {
      return [];
    }
    return this.tacticTechniqueRefs[tactic.external_id];
  }

  public findAllTactics(): Tactic[] {
    return this.tactics;
  }

  public findAllTacticsByTechniqueId(techniqueId: string): Tactic[] {
    const technique = this.findOneByExternalId(techniqueId);
    if (!technique) {
      return [];
    }
    const tactic = this.tactics.find((tactic) =>
      this.tacticTechniqueRefs[tactic.external_id].includes(technique)
    );
    if (!tactic) {
      return [];
    }
    return [tactic];
  }

  public findAllTacticsWithTechniques(): Tactic[] {
    const tactics = this.findAllTactics();
    return tactics.map((tactic) => ({
      ...tactic,
      techniques: this.tacticTechniqueRefs[tactic.external_id],
    }));
  }
}
