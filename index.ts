import { NgModule, ModuleWithProviders } from '@angular/core';
import { ConfigLoader, ConfigStaticLoader, ConfigService } from './src/config.service';

export * from './src/config.service';

export function configLoaderFactory() {
    return new ConfigStaticLoader('');
}

@NgModule()
export class ConfigModule {
    static forRoot(providedLoader: any = {
                       provide: ConfigLoader,
                       useFactory: (configLoaderFactory)
                   }): ModuleWithProviders {
        return {
            ngModule : ConfigModule,
            providers : [
                providedLoader,
                ConfigService
            ]
        };
    }
}
