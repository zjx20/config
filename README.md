# ng2-config [![npm version](https://badge.fury.io/js/ng2-config.svg)](http://badge.fury.io/js/ng2-config) [![npm downloads](https://img.shields.io/npm/dm/ng2-config.svg)](https://npmjs.org/ng2-config)

[![Linux build](https://travis-ci.org/fulls1z3/ng2-config.svg?branch=master)](https://travis-ci.org/fulls1z3/ng2-config) [![Windows build](https://ci.appveyor.com/api/projects/status/github/fulls1z3/ng2-config?branch=master&svg=true)](https://ci.appveyor.com/project/fulls1z3/ng2-config) [![coverage](https://codecov.io/github/fulls1z3/ng2-config/coverage.svg?branch=master)](https://codecov.io/gh/fulls1z3/ng2-config) [![peerDependency Status](https://david-dm.org/fulls1z3/ng2-config/peer-status.svg)](https://david-dm.org/fulls1z3/ng2-config#info=peerDependencies) [![devDependency Status](https://david-dm.org/fulls1z3/ng2-config/dev-status.svg)](https://david-dm.org/fulls1z3/ng2-config#info=devDependencies)

This repository holds the TypeScript source code and distributable bundle of **`ng2-config`**, the configuration utility for Angular2.

## Prerequisites
Verify that you are running at least `@angular v2.1.0` and `@angular/router v3.1.0`. Older versions are not tested, might produce errors.

## Getting started
### Installation
You can install **`ng2-config`** using `npm`
```
npm install ng2-config --save
```

### Adding ng2-config to your project (SystemJS)
Add `map` for **`ng2-config`** in your `systemjs.config`
```javascript
'ng2-config': 'node_modules/ng2-config/bundles/ng2-config.umd.min.js'
```

### app.module configuration
Import **ConfigModule** using the mapping `'ng2-config'` and append `ConfigModule.forRoot({...})` within the imports property of app.module (*considering the app.module is the core module in the angular application*).

You can import the **ConfigModule** using the `ConfigStaticLoader`. By default, it is configured to fetch config from the path `/config.json` (if no endpoint is specified).

You can customize this behavior (and ofc other settings) by configuring a custom `ConfigLoader`, and supplying a path/api endpoint. The following example shows the use of an exported function (instead of an inline function) for [AoT compilation].

```TypeScript
...
import { ConfigModule, ConfigLoader, ConfigStaticLoader } from 'ng2-config';
...

export function createConfigLoader() {
    return new ConfigStaticLoader('/config.json'); // PATH || API ENDPOINT
}

@NgModule({
  declarations: [
    AppComponent,
    ...
  ],
  imports: [
    ConfigModule.forRoot({
      provide: ConfigLoader,
      useFactory: (createConfigLoader)
    }),
    ...
  ],
  bootstrap: [AppComponent]
})
```

Cool! **`ng2-config`** will retrieve the configuration settings before `Angular2` **initializes** the app.

### Usage
`ConfigService` has the `getSettings` method, which you can fetch the configuration settings loaded during application initialization.

When the `getSettings` method is invoked without parameters, it returns entire application configuration. However, the `getSettings` method can be invoked using two optional parameters: **`group`** and **`key`**.

The following example shows how to read configuration setttings using all available overloads of `getSettings` method.

#### config.json
```json
{
  "system": {
  	"applicationName": "Mighty Mouse",
	"applicationUrl": "http://localhost:8000"
  },
  "seo": {
  	"pageTitle": "Tweeting bird"
  },
  "i18n":{
  	"locale": "en"
  }
}
```

#### anyclass.ts
```TypeScript
import { ConfigService } from 'ng2-config';

export class AnyClass {
  constructor(private config: ConfigService) {
    // note that ConfigService is injected into a private property of AnyClass
  }
  
  myMethodToGetUrl1() {
    // will retrieve 'http://localhost:8000'
    let url:string = this.config.getSettings('system', 'applicationUrl');
  }

  myMethodToGetUrl2() {
    // will retrieve 'http://localhost:8000'
    let url:string = this.config.getSettings('system').applicationUrl;
  }

  myMethodToGetUrl3() {
    // will retrieve 'http://localhost:8000'
    let url:string = this.config.getSettings().system.applicationUrl;
  }
  
  myMethodToGetSeo1() {
    // will retrieve {"pageTitle":"Tweeting bird"}
    let seoSettings: string = this.config.getSettings('seo');
  }

  myMethodToGetSeo1() {
    // will retrieve {"pageTitle":"Tweeting bird"}
    let seoSettings: string = this.config.getSettings().seo;
  }
}
```

## Licence
The MIT License (MIT)

Copyright (c) 2016 [Burak Tasci](http://www.buraktasci.com)

[AoT compilation]: https://angular.io/docs/ts/latest/cookbook/aot-compiler.html