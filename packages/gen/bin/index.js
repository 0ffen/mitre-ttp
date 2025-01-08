"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arg_1 = __importDefault(require("arg"));
const args = (0, arg_1.default)({});
const command = args._[0];
if (!command) {
    console.error("Usage: gen <command> [options]");
    process.exit(1);
}
switch (command) {
    case "download":
        Promise.resolve().then(() => __importStar(require("../src/download"))).then((m) => m.default());
        break;
    case "generate":
        if (!args._[1]) {
            console.error("Usage: gen translate <lang>");
            process.exit(1);
        }
        Promise.resolve().then(() => __importStar(require("../src/generate"))).then((m) => m.default(args._[1]));
        break;
    case "translate":
        if (!args._[1]) {
            console.error("Usage: gen translate <lang>");
            process.exit(1);
        }
        Promise.resolve().then(() => __importStar(require("../src/translate"))).then((m) => m.default(args._[1]));
        break;
    default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
}
