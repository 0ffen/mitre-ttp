import { DynamicModule, Module } from '@nestjs/common';
import { TTPService } from './ttp.service';
import { LanguageCode } from '@0ffen/mitre-ttp/dist/lang';

export interface TTPModuleOptions {
  language: LanguageCode;
  global?: boolean;
}

@Module({
  providers: [TTPService],
  exports: [TTPService],
})
export class TTPModule {
  static register(options: TTPModuleOptions): DynamicModule {
    const providers = [
      {
        provide: TTPService,
        useValue: new TTPService(options.language),
      },
    ];
    return {
      module: TTPModule,
      providers: providers,
      exports: providers,
      global: options.global,
    };
  }
}
