export interface Environment {
    production: boolean;
    firebase: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId?: string;
    };
    app: {
        name: string;
        version: string;
        environment: string;
    };
    api: {
        baseUrl: string;
        timeout: number;
    };
    features: {
        enableMockData: boolean;
        enableAnalytics: boolean;
        enableErrorReporting: boolean;
        debugMode: boolean;
    };
    locale: {
        currency: string;
        language: string;
        timezone: string;
    };
}
