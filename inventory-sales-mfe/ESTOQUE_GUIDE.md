# 📦 Sistema de Gestão de Estoque - FIAP Farms

## ✅ Funcionalidades Implementadas

### 🌱 **Gestão de Produtos**
- ✅ Criar produtos com categorias (Frutas, Hortaliças, Legumes, Grãos, Temperos)
- ✅ Calcular margem de lucro automaticamente
- ✅ Integração com Firebase Firestore
- ✅ Validação completa de formulários

### 📦 **Gestão de Estoque**
- ✅ Adicionar estoque para produtos existentes ou novos
- ✅ Controle de quantidade, preço unitário e custo médio
- ✅ Movimentações de estoque com histórico
- ✅ Configuração de estoque mínimo e máximo
- ✅ Controle de localização e data de vencimento

### 🔧 **Arquitetura Clean**
- ✅ Domain Entities (Product, Inventory, StockMovement)
- ✅ Repository Pattern
- ✅ Use Cases (CreateProduct, AddStock)
- ✅ Infrastructure Layer (Firebase Services)

## 🚀 Como Usar

### 1. **Adicionar Produtos**
1. Acesse a página através do menu: **"Produtos"**
2. Preencha o formulário:
   - Nome do produto
   - Categoria
   - Descrição (opcional)
   - Preço de venda
   - Preço de custo
   - URL da imagem (opcional)
3. A margem de lucro é calculada automaticamente
4. Clique em "Adicionar Produto"

### 2. **Adicionar Estoque**
1. Acesse a página através do menu: **"Add Estoque"**
2. Preencha o formulário:
   - Selecione um produto existente
   - Quantidade a adicionar
   - Preço unitário (opcional)
   - Motivo da entrada
   - Localização (opcional)
   - Data de vencimento (opcional)
   - Estoque mínimo e máximo
   - Observações (opcional)
3. O valor total é calculado automaticamente
4. Clique em "Adicionar Estoque"

## 🔄 Fluxo de Dados

### Produtos → Firebase
```
Formulário → CreateProductUseCase → FirebaseProductService → Firestore/products
```

### Estoque → Firebase
```
Formulário → AddStockUseCase → FirebaseInventoryService → Firestore/inventories + stock_movements
```

## 🗃️ Estrutura do Banco de Dados

### Collection: `products`
```json
{
  "id": "auto-generated",
  "name": "Tomate Orgânico",
  "category": "Hortaliças",
  "description": "Tomate orgânico sem agrotóxicos",
  "unitPrice": 8.50,
  "costPrice": 3.20,
  "profitMargin": 165.625,
  "imageUrl": "https://...",
  "createdAt": "2025-09-28T20:00:00Z",
  "updatedAt": "2025-09-28T20:00:00Z"
}
```

### Collection: `inventories`
```json
{
  "id": "auto-generated",
  "productId": "product-id-reference",
  "currentStock": 150,
  "minimumStock": 20,
  "maximumStock": 500,
  "averageCost": 3.45,
  "lastStockUpdate": "2025-09-28T20:00:00Z",
  "location": "Galpão A",
  "expirationDate": "2025-10-15T00:00:00Z",
  "createdAt": "2025-09-28T20:00:00Z",
  "updatedAt": "2025-09-28T20:00:00Z"
}
```

### Collection: `stock_movements`
```json
{
  "id": "auto-generated",
  "inventoryId": "inventory-id-reference",
  "movementType": "in",
  "quantity": 50,
  "unitPrice": 3.50,
  "reason": "Produção Própria",
  "performedBy": "Sistema",
  "performedAt": "2025-09-28T20:00:00Z",
  "notes": "Primeira colheita da temporada"
}
```

## 🔐 Configuração Firebase

### Regras de Segurança Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produtos: apenas usuários autenticados
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    
    // Inventários: apenas usuários autenticados
    match /inventories/{inventoryId} {
      allow read, write: if request.auth != null;
    }
    
    // Movimentações de estoque: apenas usuários autenticados
    match /stock_movements/{movementId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Próximas Funcionalidades

### Em Desenvolvimento
- [ ] Dashboard de vendas
- [ ] Dashboard de produção  
- [ ] Relatórios de estoque baixo
- [ ] Alertas de vencimento
- [ ] Gráficos de movimentação

### Planejadas
- [ ] Códigos de barras
- [ ] Integração com fornecedores
- [ ] Previsão de demanda
- [ ] App mobile para coleta

## 🐛 Troubleshooting

### Problema: Produto não salva
**Solução:** Verifique as regras do Firebase e se o usuário está autenticado

### Problema: Estoque não atualiza
**Solução:** Verifique se o produto existe e se os dados estão válidos

### Problema: Erro de permissão
**Solução:** Configure as regras do Firebase conforme documentação

## 📱 Navegação

- **Dashboard**: `/home`
- **Adicionar Produto**: `/home/add-product`
- **Adicionar Estoque**: `/home/add-stock`
- **Vendas**: `/home/sales`
- **Produção**: `/home/production`
- **Inventário**: `/home/inventory`
- **Metas**: `/home/goals`

---
*Sistema desenvolvido com Angular 15, Firebase/Firestore, Tailwind CSS e Clean Architecture*
