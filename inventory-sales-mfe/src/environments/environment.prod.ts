export const environment = {
    production: true,
    firebase: {
        // Configuração de produção - usando o mesmo projeto por enquanto
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
        environment: "production"
    },
    // URLs de API
    api: {
        baseUrl: "https://api.fiap-farms.com",
        timeout: 30000
    },
    // Configurações de features
    features: {
        enableMockData: false, // Dados reais em produção
        enableAnalytics: true,
        enableErrorReporting: true,
        debugMode: false
    },
    // Configurações regionais
    locale: {
        currency: "BRL",
        language: "pt-BR",
        timezone: "America/Sao_Paulo"
    }
};