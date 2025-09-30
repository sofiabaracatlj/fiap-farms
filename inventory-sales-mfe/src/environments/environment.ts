export const environment = {
    production: false,
    useFirebase: true,
    firebase: {
        // Configuração correta para o projeto fiap-farms-e0f26
        apiKey: "AIzaSyDWZ-dusKkdRvpPv0BTl9Pc5gcMi-kLXcM",
        authDomain: "fiap-farms-e0f26.firebaseapp.com",
        projectId: "fiap-farms-e0f26",
        storageBucket: "fiap-farms-e0f26.firebasestorage.app",
        messagingSenderId: "711781164631",
        appId: "1:711781164631:web:5e25a7120234f452eda512"
    },
    // Configurações específicas da aplicação
    app: {
        name: "FIAP Farms - Inventory & Sales",
        version: "1.0.0",
        environment: "development"
    },
    // URLs de API (caso precise no futuro)
    api: {
        baseUrl: "https://api.fiap-farms-dev.com",
        timeout: 30000
    },
    // Configurações de features
    features: {
        enableMockData: false, // Mudará para true temporariamente até configurar Firebase real
        enableAnalytics: false,
        enableErrorReporting: false,
        debugMode: true
    },
    // Configurações regionais
    locale: {
        currency: "BRL",
        language: "pt-BR",
        timezone: "America/Sao_Paulo"
    }
};
