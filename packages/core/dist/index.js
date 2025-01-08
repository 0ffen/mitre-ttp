"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function binarySearch(arr, target, key) {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        if (arr[mid][key] === target) {
            return arr[mid];
        }
        else if (arr[mid][key] < target) {
            start = mid + 1;
        }
        else {
            end = mid - 1;
        }
    }
    return undefined;
}
function upperBound(arr, target, key) {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        if (arr[mid][key] <= target) {
            start = mid + 1;
        }
        else {
            end = mid - 1;
        }
    }
    return start;
}
function lowerBound(arr, target, key) {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        if (arr[mid][key] < target) {
            start = mid + 1;
        }
        else {
            end = mid - 1;
        }
    }
    return start;
}
class TTPDatabase {
    constructor(lang) {
        this.lang = lang;
        this.tactics = [];
        this.techniques = [];
        this.tacticTechniqueRefs = {};
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(`${__dirname}/../translate/${lang}.json`), "utf-8"));
        this.tactics = data.tactics;
        this.techniques = data.techniques;
        this.tacticTechniqueRefs = data.tactic_technique;
    }
    findOneByExternalId(externalId) {
        return binarySearch(this.tactics, externalId, "external_id");
    }
    findAllTechniques() {
        const start = lowerBound(this.tactics, "T0000", "external_id");
        const end = upperBound(this.tactics, "T9999", "external_id");
        return this.tactics.slice(start, end);
    }
    findAllTactics() {
        const start = lowerBound(this.tactics, "TA000", "external_id");
        const end = upperBound(this.tactics, "TA999", "external_id");
        return this.tactics.slice(start, end);
    }
    findAllByDepth(keyword) {
        keyword = keyword.trim().toUpperCase();
        if (keyword.startsWith("TA")) {
            const techniqueKeyword = keyword.split(">")[1].trim();
            if (techniqueKeyword) {
                const keyword = techniqueKeyword.replace(" ", "").replace(">", ".");
                return this.techniques.filter((item) => item.external_id.includes(keyword));
            }
            else {
                return this.tactics
                    .filter((item) => item.external_id.includes(keyword))
                    .flatMap((tactic) => this.tacticTechniqueRefs[tactic.external_id]);
            }
        }
        else {
            return this.tactics.filter((item) => item.external_id.includes(keyword));
        }
    }
}
exports.default = TTPDatabase;
