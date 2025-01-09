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
interface Technique extends TTP {
}
export default class TTPDatabase {
    private lang;
    private tactics;
    private techniques;
    private tacticTechniqueRefs;
    constructor(lang: LanguageCode);
    static hasLanguage(lang: LanguageCode): boolean;
    findOneByExternalId(externalId: string): TTP | undefined;
    findAllTechniques(): Technique[];
    findTechniquesByTacticId(tacticId: string): Technique[];
    findAllTactics(): Tactic[];
    findTacticsByTechniqueId(techniqueId: string): Tactic[];
    findAllTacticsWithTechniques(): Tactic[];
}
export {};
