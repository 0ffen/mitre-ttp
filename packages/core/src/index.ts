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
  private tactics: TTP[] = [];
  private techniques: TTP[] = [];
  private tacticTechniqueRefs: Record<string, TTP[]> = {};

  constructor(private lang: LanguageCode) {
    const data = JSON.parse(
      fs.readFileSync(
        path.resolve(`${__dirname}/../translate/${lang}.json`),
        "utf-8"
      )
    );
    this.tactics = data.tactics;
    this.techniques = data.techniques;
    this.tacticTechniqueRefs = data.tactic_technique;
  }

  public findOneByExternalId(externalId: string): TTP | undefined {
    return binarySearch(this.tactics, externalId, "external_id");
  }

  public findAllTechniques(): TTP[] {
    const start = lowerBound(this.tactics, "T0000", "external_id");
    const end = upperBound(this.tactics, "T9999", "external_id");

    return this.tactics.slice(start, end);
  }

  public findAllTactics(): TTP[] {
    const start = lowerBound(this.tactics, "TA000", "external_id");
    const end = upperBound(this.tactics, "TA999", "external_id");

    return this.tactics.slice(start, end);
  }

  public findAllByDepth(keyword: string): TTP[] {
    keyword = keyword.trim().toUpperCase();
    if (keyword.startsWith("TA")) {
      const techniqueKeyword = keyword.split(">")[1].trim();
      if (techniqueKeyword) {
        const keyword = techniqueKeyword.replace(" ", "").replace(">", ".");
        return this.techniques.filter((item) =>
          item.external_id.includes(keyword)
        );
      } else {
        return this.tactics
          .filter((item) => item.external_id.includes(keyword))
          .flatMap((tactic) => this.tacticTechniqueRefs[tactic.external_id]);
      }
    } else {
      return this.tactics.filter((item) => item.external_id.includes(keyword));
    }
  }
}
