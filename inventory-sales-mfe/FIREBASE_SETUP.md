# Configuração do Firebase para FIAP Farms

## Passos para configurar o Firebase:

### 1. Criar projeto no Firebase Console
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: "fiap-farms"
4. Ative o Google Analytics se desejar
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (ex: southamerica-east1)

### 3. Configurar regras de segurança
Na aba "Rules" do Firestore, use estas regras para desenvolvimento:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Obter credenciais do projeto
1. No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem)
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique no ícone "</>" para criar um app web
4. Nome do app: "fiap-farms-web"
5. Copie as credenciais do Firebase

### 5. Configurar no Angular
Substitua as credenciais em src/environments/environment.ts:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "fiap-farms.firebaseapp.com",
    projectId: "fiap-farms",
    storageBucket: "fiap-farms.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
  },
  features: {
    enableMockData: false,
    enableAnalytics: false,
    enableErrorReporting: false,
    debugMode: true
  }
};
```

### 6. Testar a conexão
Execute o projeto e verifique se as requisições funcionam sem erros de permissão.

### 7. Collections que serão criadas automaticamente:
- products
- inventories  
- sales
- stock_movements

### Regras de segurança recomendadas para produção:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produtos - leitura pública, escrita apenas autenticados
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Inventários - apenas usuários autenticados
    match /inventories/{inventoryId} {
      allow read, write: if request.auth != null;
    }
    
    // Vendas - apenas usuários autenticados
    match /sales/{saleId} {
      allow read, write: if request.auth != null;
    }
    
    // Movimentações de estoque - apenas usuários autenticados
    match /stock_movements/{movementId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
