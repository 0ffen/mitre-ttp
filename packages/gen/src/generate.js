"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const temp_js_1 = require("./utils/temp.js");
const translate_js_1 = require("./translate.js");
function parseRaw(data) {
    if (data.type === "x-mitre-tactic") {
        return {
            title: data.name,
            description: data.description,
            external_id: data.external_references[0].external_id,
            modified: data.modified,
        };
    }
    else {
        return {
            title: data.name,
            description: data.description,
            external_id: data.external_references[0].external_id,
            modified: data.modified,
        };
    }
}
function parseIfExists(path, defaultValue) {
    if (!fs_1.default.existsSync(path))
        return defaultValue;
    return JSON.parse(fs_1.default.readFileSync(path, "utf-8"));
}
function external_id(data) {
    return data.external_references[0].external_id;
}
function default_1(lang) {
    console.log(`Generating ${lang}...`);
    const old_data = parseIfExists(path_1.default.join(translate_js_1.translatePath, `${lang}.json`), []);
    const new_data = parseIfExists(path_1.default.resolve(temp_js_1.tempPath, "enterprise-attack.json"), null);
    if (old_data.length === 0)
        console.warn(`Language ${lang} not found`);
    if (new_data === null)
        throw new Error("enterprise-attack.json not found");
    const result = [];
    const new_objects = new_data.objects.filter((o) => ["x-mitre-tactic", "attack-pattern"].includes(o.type));
    const tactics = new_objects.filter((o) => o.type === "x-mitre-tactic");
    for (const new_object of new_objects) {
        const old_object = old_data.find((o) => o.external_id === external_id(new_object));
        if (old_object && old_object.modified === new_object.modified) {
            result.push(Object.assign(Object.assign({}, old_object), { translated: true }));
        }
        else if (new_object.type === "attack-pattern") {
            const __kill_chain_phase_names = new_object.kill_chain_phases.map((k) => k.phase_name);
            const ref$tactics = tactics.filter((t) => __kill_chain_phase_names.includes(t.x_mitre_shortname));
            result.push(Object.assign(Object.assign({}, parseRaw(new_object)), { tactics: ref$tactics.map(external_id) }));
        }
        else {
            result.push(parseRaw(new_object));
        }
    }
    fs_1.default.writeFileSync(path_1.default.resolve(temp_js_1.tempPath, "objects.json"), JSON.stringify(result, null, 2));
    const count = result.filter((r) => !r.translated).length;
    console.log(`Need to translate ${count} objects`);
}
