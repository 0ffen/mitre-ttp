import fs from "fs";
import path from "path";
import { LanguageCode } from "./lang";

interface TTP {
  title: string;
  description: string;
  external_id: string;
  modified: string;
  translated?: boolean;
  tactics?: string[];
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

class TTPDatabase {
  private data: TTP[] = [];
  private tacticRefs: Record<string, TTP[]> = {};

  constructor(private lang: LanguageCode) {
    this.data = JSON.parse(
      fs.readFileSync(
        path.resolve(`${__dirname}/../translate/${lang}.json`),
        "utf-8"
      )
    );

    this.data.forEach((item) => {
      if (item.tactics) {
        item.tactics.forEach((tactic) => {
          if (!this.tacticRefs[tactic]) {
            this.tacticRefs[tactic] = [];
          }

          this.tacticRefs[tactic].push(item);
        });
      }
    });
  }

  public findOneByExternalId(externalId: string): TTP | undefined {
    return binarySearch(this.data, externalId, "external_id");
  }

  public findAllTechniques(): TTP[] {
    const start = lowerBound(this.data, "T0000", "external_id");
    const end = upperBound(this.data, "T9999", "external_id");

    return this.data.slice(start, end);
  }

  public findAllTactics(): TTP[] {
    const start = lowerBound(this.data, "TA000", "external_id");
    const end = upperBound(this.data, "TA999", "external_id");

    return this.data.slice(start, end);
  }

  public findAllByKeyword(keyword: string): TTP[] {
    keyword = keyword.trim().toUpperCase();
    if (keyword.startsWith("TA")) {
      const techniqueKeyword = keyword.split(">")[1];
      if (techniqueKeyword) {
        return this.data.filter((item) =>
          item.title.includes(techniqueKeyword)
        );
      } else {
        return this.data
          .filter((item) => item.title.includes(techniqueKeyword))
          .flatMap((tactic) => this.tacticRefs[tactic.external_id]);
      }
    } else {
      return this.data.filter((item) => item.title.includes(keyword));
    }
  }
}

console.log(new TTPDatabase("ko-KR").findAllTactics());
