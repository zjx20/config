import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { ConfigLoader, ConfigStaticLoader, ConfigService } from './src/config.service';

export * from './src/config.service';

export function configLoaderFactory(): ConfigLoader {
    return new ConfigStaticLoader('');
}

export function configInitializerFactory(config: ConfigService): any {
    return () => config.init();
}

@NgModule()
export class ConfigModule {
    static forRoot(providedLoader: any = {
                       provide : ConfigLoader,
                       useFactory : (configLoaderFactory)
                   }): ModuleWithProviders {
        return {
            ngModule : ConfigModule,
            providers : [
                providedLoader,
                ConfigService,
                {
                    provide : APP_INITIALIZER,
                    useFactory : (configInitializerFactory),
                    deps : [ConfigService],
                    multi : true
                }
            ]
        };
    }
}
