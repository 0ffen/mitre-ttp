import TTPDatabase, { Tactic, Technique } from '@0ffen/mitre-ttp';
import { LanguageCode } from '@0ffen/mitre-ttp/dist/lang';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TTPService {
  private readonly database: TTPDatabase;
  constructor(private readonly language: LanguageCode) {
    this.database = new TTPDatabase(this.language);
  }

  public findAllTactics(): Tactic[] {
    return this.database.findAllTactics();
  }

  public findAllTacticsWithTechniques(): Tactic[] {
    return this.database.findAllTacticsWithTechniques();
  }

  public findAllTechniques(): Technique[] {
    return this.database.findAllTechniques();
  }

  public findOneByExternalId(
    externalId: string,
  ): Tactic | Technique | undefined {
    return this.database.findOneByExternalId(externalId);
  }

  public findTacticsByTechniqueId(techniqueId: string): Tactic[] {
    return this.database.findTacticsByTechniqueId(techniqueId);
  }

  public findTechniquesByTacticId(tacticId: string): Technique[] {
    return this.database.findTechniquesByTacticId(tacticId);
  }
}
