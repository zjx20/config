// angular
import { Injector } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ResponseOptions, Response, XHRBackend, HttpModule } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

// module
import { ConfigModule, ConfigLoader, ConfigStaticLoader, ConfigService } from '..';

let mockSettings = {
    'system': {
        'applicationName': 'Mighty Mouse',
        'applicationUrl': 'http://localhost:8000'
    },
    'i18n': {
        'locale': 'en'
    }
};

// test module configuration for each test
const testModuleConfig = (options?: any) => {
    TestBed.configureTestingModule({
        imports: [
            HttpModule,
            ConfigModule.forRoot(options)
        ],
        providers: [
            {provide: XHRBackend, useClass: MockBackend}
        ]
    });
};

const mockBackendResponse = (connection: MockConnection, response: any) => {
    connection.mockRespond(new Response(new ResponseOptions({body: response})));
};

const mockBackendError = (connection: MockConnection, error: string) => {
    connection.mockError(new Error(error));
};

let injector: Injector;
let backend: MockBackend;
let config: ConfigService;
let connection: MockConnection; // this will be set when a new connection is emitted from the backend.

describe('ConfigLoader',
    () => {
        afterEach(() => {
            injector = undefined;
            backend = undefined;
            config = undefined;
            connection = undefined;
        });

        testLoader();
    });

describe('ConfigService',
    () => {
        beforeEach(() => {
            testModuleConfig();

            injector = getTestBed();
            config = injector.get(ConfigService);
            config.settingsRepository = mockSettings;
        });

        afterEach(() => {
            injector = undefined;
            config = undefined;
        });

        testService();
    });

function testLoader(): void {
    function run(instance: any) {
        injector = getTestBed();
        backend = injector.get(XHRBackend);
        config = injector.get(ConfigService);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe((c: MockConnection) => connection = c);

        expect(config).toBeDefined();
        expect(config.loader).toBeDefined();
        expect(config.loader instanceof instance).toBeTruthy();

        // inits the config, triggers an xhr request
        config.init();

        // mock error
        mockBackendError(connection, '500');

        // this will produce error at the backend
        config.init()
            .then((res: any) => {
                expect(res).toThrowError('Error: Configuration service unreachable!');
            });

        // mock response
        mockBackendResponse(connection, mockSettings);

        // this will init config
        config.init()
            .then((res: any) => {
                expect(res).toBeDefined();
            });
    }

    it('should be able to return the default apiEndpoint', () => {
        const res = new ConfigStaticLoader().getApiEndpoint();

        expect(res).toEqual('/config.json');
    });

    it('should be able to provide ConfigStaticLoader', () => {
        testModuleConfig();

        run(ConfigStaticLoader);
    });

    it('should be able to provide any ConfigLoader', () => {
        class CustomLoader implements ConfigLoader {
            getApiEndpoint(): string {
                return '/config.json';
            }
        }

        testModuleConfig({ provide: ConfigLoader, useClass: CustomLoader });

        run(CustomLoader);
    });
}

function testService(): void {
    it('is defined',
        () => {
            expect(ConfigService).toBeDefined();
            expect(config).toBeDefined();
            expect(config instanceof ConfigService).toBeTruthy();
        });

    it('should be able to get all settings',
        () => {
            expect(config.getSettings()).toEqual(mockSettings);
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

    it('should be able to get settings using group',
        () => {
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

    it('should be able to get settings using group/key combination',
        () => {
            expect(config.getSettings('system', 'applicationName')).toEqual('Mighty Mouse');
            expect(config.getSettings('system', 'applicationUrl')).toEqual('http://localhost:8000');
            expect(config.getSettings('i18n', 'locale')).toEqual('en');
        });

    it('should throw if you pass an invalid group',
        () => {
            expect(() => {
                    config.getSettings('layout');
                })
                .toThrowError('Error: No setting found with the specified group [layout]!');
        });

    it('should throw if you pass an invalid key',
        () => {
            expect(() => {
                    config.getSettings('system', 'workingTheme');
                })
                .toThrowError('Error: No setting found with the specified group/key [system/workingTheme]!');
        });
}
