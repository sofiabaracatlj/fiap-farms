# Resolução de Problemas de Autenticação Firebase

Este documento explica as correções implementadas para resolver os problemas de autenticação com o Firebase no projeto FIAP Farms.

## Problemas Identificados

1. **Token de autenticação não sendo enviado**: As requisições do Firestore não incluíam o token de autenticação do usuário
2. **Sessão não sendo restaurada**: O usuário autenticado no sessionStorage não era reconhecido pelo Firebase
3. **Falta de configuração de persistência**: A autenticação não persistia entre recarregamentos da página

## Soluções Implementadas

### 1. Interceptor HTTP para Firebase (`firebase-auth.interceptor.ts`)

- Intercepta todas as requisições para o Firebase
- Adiciona automaticamente o token de autenticação às requisições
- Fornece fallback em caso de erro

### 2. Melhorias no SessionAuthService

**Métodos Adicionados:**
- `signInAnonymously()`: Login anônimo como fallback
- `signInWithEmailAndPassword()`: Login com credenciais específicas
- `setFirebaseAuthState()`: Configuração manual do estado de autenticação

**Melhorias:**
- Melhor tratamento de erros na restauração de autenticação
- Fallbacks múltiplos para garantir que o usuário sempre tenha alguma autenticação

### 3. FirebaseProductService Atualizado

**Mudanças:**
- Injeção do `SessionAuthService` e `AngularFireAuth`
- Método `ensureAuthenticatedOperation()` para garantir autenticação antes das operações
- Verificação de autenticação em todos os métodos de consulta (`findAll`, `findById`, etc.)

### 4. Serviço de Inicialização (`firebase-initialization.service.ts`)

- Gerencia a inicialização completa da aplicação
- Configura persistência de autenticação
- Restaura sessão do sessionStorage
- Fornece login anônimo como fallback

### 5. Configuração de Persistência

- Habilitada persistência no `firebase.module.ts`
- Configuração de persistência local no app initialization

## Como Usar

### Inicialização Automática

A aplicação agora inicializa automaticamente no `AppComponent`:

```typescript
async ngOnInit() {
  await this.firebaseInitService.initializeApp();
}
```

### Verificação Manual de Autenticação

```typescript
const authStatus = await this.firebaseInitService.getAuthStatus();
console.log('Status:', authStatus);
```

### Login Manual (se necessário)

```typescript
// Login anônimo
await this.sessionAuthService.signInAnonymously();

// Login com email/senha
await this.sessionAuthService.signInWithEmailAndPassword(email, password);
```

## Fluxo de Autenticação

1. **Inicialização da App**:
   - Configura persistência
   - Verifica sessionStorage
   - Restaura autenticação se válida
   - Fallback para login anônimo

2. **Operações do Firestore**:
   - Interceptor adiciona token automaticamente
   - Services verificam autenticação antes das operações
   - Restauração automática em caso de falha

3. **Persistência**:
   - Dados salvos localmente
   - Sincronização entre abas
   - Manutenção da sessão

## Debugging

Para debugar problemas de autenticação, verifique o console para logs:

- `FirebaseInitializationService - *`: Inicialização da app
- `SessionAuthService - *`: Operações de autenticação
- `FirebaseProductService - *`: Operações de produtos
- `FirebaseAuthInterceptor - *`: Interceptação de requisições

## Regras de Segurança Recomendadas

Para desenvolvimento, use estas regras no Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados (incluindo anônimos)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Para produção, implemente regras mais restritivas baseadas no seu modelo de negócio.

## Próximos Passos

1. **Implementar autenticação real**: Substitua o login anônimo por autenticação adequada
2. **Configurar regras de segurança**: Implemente regras específicas para cada collection
3. **Adicionar refresh de token**: Implemente renovação automática de tokens expirados
4. **Monitoramento**: Adicione logging mais detalhado para produção
