import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/toPromise'

@Injectable()
export class ConfigService {
    settingsRepository: any = undefined;

    constructor(private http: Http) { }
    
    load(endpoint: string) {
        return this.http.get(endpoint)
            .map(res => res.json())
            .toPromise()
            .then(settings => this.settingsRepository = settings)
            .catch(() => {
                throw new Error('Error: Configuration service unreachable!');
            });
    }

    get(group?: string, key?: string): any {
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
