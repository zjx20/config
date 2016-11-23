import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/toPromise'

export abstract class ConfigLoader {
    abstract getApiEndpoint(): any;
}

export class ConfigStaticLoader implements ConfigLoader {
    constructor(private apiEndpoint: string) {}

    getApiEndpoint(): any {
        return this.apiEndpoint;
    }
}

@Injectable() 
export class ConfigService {
    settingsRepository: any = undefined;

    constructor(private http: Http,
                private loader: ConfigLoader) {}
    
    loadSettings() {
        return this.http.get(this.loader.getApiEndpoint())
            .map(res => res.json())
            .toPromise()
            .then(settings => this.settingsRepository = settings)
            .catch(() => {
                throw new Error('Error: Configuration service unreachable!');
            });
    }

    getSettings(group?: string, key?: string): any {
        if (!group) {
            return this.settingsRepository;
        }

        if (!this.settingsRepository[group]) {
            throw new Error(`Error: No setting found with the specified group [${group}]!`);
        }

        if (!key) {
            return this.settingsRepository[group];
        }

        if (!this.settingsRepository[group][key]) {
            throw new Error(`Error: No setting found with the specified group/key [${group}/${key}]!`);
        }

        return this.settingsRepository[group][key];
    }
}
