// angular
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Injector } from '@angular/core';
import { async, getTestBed, inject, TestBed } from '@angular/core/testing';
import { Http, BaseRequestOptions, HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

// module
import { ConfigModule, ConfigLoader, ConfigStaticLoader, ConfigService } from '..';

let apiEndpoint = '/config.json';
let settingsRepository = {
    'system': {
        'applicationName': 'Mighty Mouse',
        'applicationUrl': 'http://localhost:8000'
    },
    'i18n': {
        'locale': 'en'
    }
};

// test module configuration for each test
const testModuleConfig = (moduleOptions?: any) => {
    // reset the test environment before initializing it.
    TestBed.resetTestEnvironment();

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting())
        .configureTestingModule({
            imports: [
                HttpModule,
                ConfigModule.forRoot(moduleOptions)
            ],
            providers: [
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions
            ]
        });
};

const mockBackendResponse = (connection: MockConnection, response: any) => {
    connection.mockRespond(new Response(new ResponseOptions({ body: response })));
};

const mockBackendError = (connection: MockConnection, error: string) => {
    connection.mockError(new Error(error));
};

describe('ng2-config:',
    () => {
        beforeEach(() => {
            function createConfigLoader(): ConfigStaticLoader {
                return new ConfigStaticLoader(apiEndpoint);
            }

            testModuleConfig({ provide: ConfigLoader, useFactory: (createConfigLoader) });
        });

        describe('ConfigLoader',
            () => {
                it('should be able to return the default apiEndpoint',
                    () => {
                        const res = new ConfigStaticLoader().getApiEndpoint();

                        expect(res).toEqual(apiEndpoint);
                    });

                it('should be able to provide ConfigStaticLoader',
                    () => {
                        function createConfigLoader(): ConfigStaticLoader {
                            return new ConfigStaticLoader(apiEndpoint);
                        }

                        testModuleConfig({ provide: ConfigLoader, useFactory: (createConfigLoader) });

                        const injector = getTestBed();
                        const config = injector.get(ConfigService);

                        expect(config).toBeDefined();
                        expect(config.loader).toBeDefined();
                        expect(config.loader instanceof ConfigStaticLoader).toBeTruthy();
                    });

                it('should be able to provide any ConfigLoader',
                    () => {
                        class CustomLoader implements ConfigLoader {
                            getApiEndpoint(): string {
                                return apiEndpoint;
                            }
                        }

                        testModuleConfig({ provide: ConfigLoader, useClass: CustomLoader });

                        const injector = getTestBed();
                        const config = injector.get(ConfigService);

                        expect(config).toBeDefined();
                        expect(config.loader).toBeDefined();
                        expect(config.loader instanceof CustomLoader).toBeTruthy();
                    });
            });

        describe('ConfigService',
            () => {
                it('is defined',
                    inject([ConfigService],
                        (config: ConfigService) => {
                            expect(ConfigService).toBeDefined();
                            expect(config).toBeDefined();
                            expect(config instanceof ConfigService).toBeTruthy();
                        }));

                it('should throw if you do not provide settings',
                    inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock error
                            backend.connections.subscribe((c: MockConnection) => mockBackendError(c, '500'));

                            // this will produce error at the backend
                            config.init()
                                .then((res: any) => {
                                    expect(res).toThrowError('Error: apiEndpoint unreachable!');
                                });
                        }));

                it('should be able to get all settings',
                    async(inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock response
                            backend.connections.subscribe((c: MockConnection) => mockBackendResponse(c, settingsRepository));

                            config.init()
                                .then(() => {
                                    expect(config.getSettings()).toEqual(settingsRepository);
                                    expect(config.getSettings().system)
                                        .toEqual({
                                            'applicationName': 'Mighty Mouse',
                                            'applicationUrl': 'http://localhost:8000'
                                        });
                                    expect(config.getSettings().system.applicationName).toEqual('Mighty Mouse');
                                    expect(config.getSettings().system.applicationUrl).toEqual('http://localhost:8000');
                                    expect(config.getSettings().i18n)
                                        .toEqual({
                                            'locale': 'en'
                                        });
                                    expect(config.getSettings().i18n.locale).toEqual('en');
                                });
                        })));

                it('should be able to get settings using group',
                    async(inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock response
                            backend.connections.subscribe((c: MockConnection) => mockBackendResponse(c, settingsRepository));

                            config.init()
                                .then(() => {
                                    expect(config.getSettings('system'))
                                        .toEqual({
                                            'applicationName': 'Mighty Mouse',
                                            'applicationUrl': 'http://localhost:8000'
                                        });
                                    expect(config.getSettings('system').applicationName).toEqual('Mighty Mouse');
                                    expect(config.getSettings('system').applicationUrl).toEqual('http://localhost:8000');
                                    expect(config.getSettings('i18n'))
                                        .toEqual({
                                            'locale': 'en'
                                        });
                                    expect(config.getSettings('i18n').locale).toEqual('en');
                                });
                        })));

                it('should be able to get settings using group/key combination',
                    async(inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock response
                            backend.connections.subscribe((c: MockConnection) => mockBackendResponse(c, settingsRepository));

                            config.init()
                                .then(() => {
                                    expect(config.getSettings('system', 'applicationName')).toEqual('Mighty Mouse');
                                    expect(config.getSettings('system', 'applicationUrl')).toEqual('http://localhost:8000');
                                    expect(config.getSettings('i18n', 'locale')).toEqual('en');
                                });
                        })));

                it('should throw if you pass an invalid group',
                    async(inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock response
                            backend.connections.subscribe((c: MockConnection) => mockBackendResponse(c, settingsRepository));

                            config.init()
                                .then(() => {
                                    expect(() => {
                                            config.getSettings('layout');
                                        })
                                        .toThrowError('Error: No setting found with the specified group [layout]!');
                                });
                        })));

                it('should throw if you pass an invalid key',
                    async(inject([MockBackend, ConfigService],
                        (backend: MockBackend, config: ConfigService) => {
                            // mock response
                            backend.connections.subscribe((c: MockConnection) => mockBackendResponse(c, settingsRepository));

                            config.init()
                                .then(() => {
                                    expect(() => {
                                            config.getSettings('system', 'workingTheme');
                                        })
                                        .toThrowError('Error: No setting found with the specified group/key [system/workingTheme]!');
                                });
                        })));
            });
    });
