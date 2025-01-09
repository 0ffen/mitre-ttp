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
        this.tacticTechniqueRefs = Object.fromEntries(Object.entries(data.tactic_technique).map(([tacticId, techniqueIds]) => {
            return [
                tacticId,
                techniqueIds.map((techniqueId) => this.findOneByExternalId(techniqueId)),
            ];
        }));
    }
    static hasLanguage(lang) {
        return fs_1.default.existsSync(path_1.default.resolve(`${__dirname}/../translate/${lang}.json`));
    }
    findOneByExternalId(externalId) {
        if (externalId.startsWith("TA")) {
            return binarySearch(this.tactics, externalId, "external_id");
        }
        return binarySearch(this.techniques, externalId, "external_id");
    }
    findAllTechniques() {
        return this.techniques;
    }
    findAllTechniquesByTacticId(tacticId) {
        const tactic = this.findOneByExternalId(tacticId);
        if (!tactic) {
            return [];
        }
        return this.tacticTechniqueRefs[tactic.external_id];
    }
    findAllTactics() {
        return this.tactics;
    }
    findAllTacticsByTechniqueId(techniqueId) {
        const technique = this.findOneByExternalId(techniqueId);
        if (!technique) {
            return [];
        }
        const tactic = this.tactics.find((tactic) => this.tacticTechniqueRefs[tactic.external_id].includes(technique));
        if (!tactic) {
            return [];
        }
        return [tactic];
    }
    findAllTacticsWithTechniques() {
        const tactics = this.findAllTactics();
        return tactics.map((tactic) => (Object.assign(Object.assign({}, tactic), { techniques: this.tacticTechniqueRefs[tactic.external_id] })));
    }
}
exports.default = TTPDatabase;
