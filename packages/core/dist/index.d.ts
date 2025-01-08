import { LanguageCode } from "./lang";
interface TTP {
    title: string;
    description: string;
    external_id: string;
    modified: string;
    translated?: boolean;
}
export default class TTPDatabase {
    private lang;
    private tactics;
    private techniques;
    private tacticTechniqueRefs;
    constructor(lang: LanguageCode);
    findOneByExternalId(externalId: string): TTP | undefined;
    findAllTechniques(): TTP[];
    findAllTactics(): TTP[];
    findAllByDepth(keyword: string): TTP[];
}
export {};
