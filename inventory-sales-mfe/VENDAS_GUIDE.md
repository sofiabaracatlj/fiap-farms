# 🛒 Sistema de Gestão de Vendas - FIAP Farms

## ✅ Funcionalidades Implementadas

### 🛒 **Gestão de Vendas**
- ✅ Registrar vendas com produtos existentes
- ✅ Cálculo automático de totais e lucros
- ✅ Controle de formas de pagamento (PIX, Cartão, Dinheiro, etc.)
- ✅ Atualização automática do estoque após venda
- ✅ Registro de movimentação de estoque (saída)
- ✅ Validação de estoque disponível

### 🧮 **Cálculos Automáticos**
- ✅ **Valor Total**: Quantidade × Preço Unitário
- ✅ **Lucro**: (Preço Venda - Preço Custo) × Quantidade
- ✅ **Margem de Lucro**: Percentual de lucro sobre o preço de venda
- ✅ **Validação de Estoque**: Verifica disponibilidade antes da venda

### 🏗️ **Arquitetura Clean**
- ✅ **Domain**: Sale Entity com status e métodos de pagamento
- ✅ **Repository**: SaleRepository com operações CRUD
- ✅ **Use Case**: CreateSaleUseCase com lógica de negócio
- ✅ **Infrastructure**: FirebaseSaleService para persistência

## 🚀 Como Usar

### 1. **Registrar Vendas**
1. Acesse: **Menu → "Add Venda"**
2. Preencha o formulário:
   - **Produto**: Selecione da lista (com preços automáticos)
   - **Quantidade**: Unidades vendidas
   - **Preço Unitário**: Auto-preenchido (editável)
   - **Cliente**: Nome e email (opcionais)
   - **Data da Venda**: Padrão hoje
   - **Forma de Pagamento**: PIX, Cartão, Dinheiro, etc.
   - **Status**: Concluída ou Pendente
   - **Observações**: Informações extras

3. **Visualização em Tempo Real:**
   - 💰 **Valor Total** da venda
   - 📈 **Lucro Estimado**
   - 📊 **Margem de Lucro** desta venda

4. Clique em **"Registrar Venda"**

### 2. **Informações do Produto**
Ao selecionar um produto, o sistema mostra:
- 💲 Preço de venda padrão
- 💰 Preço de custo
- 📈 Margem de lucro atual
- 🏷️ Categoria do produto

## 🔄 Fluxo de Processos

### Venda → Firebase + Estoque
```
1. Formulário → CreateSaleUseCase
2. Buscar produto → Calcular valores
3. Validar estoque disponível
4. Criar venda → FirebaseSaleService
5. Atualizar estoque → InventoryRepository
6. Registrar movimento → StockMovement
```

### Validações Automáticas
- ✅ **Estoque Suficiente**: Bloqueia venda se não há produtos
- ✅ **Produto Existente**: Verifica se produto é válido
- ✅ **Valores Positivos**: Quantidade e preços > 0
- ✅ **Email Válido**: Formato correto se informado

## 🗃️ Estrutura do Banco de Dados

### Collection: `sales`
```json
{
  "id": "auto-generated",
  "productId": "product-id-reference",
  "quantity": 15,
  "unitPrice": 8.50,
  "totalAmount": 127.50,
  "profit": 78.75,
  "customerName": "João Silva",
  "customerEmail": "joao@email.com",
  "saleDate": "2025-09-28T10:30:00Z",
  "status": "completed",
  "paymentMethod": "pix",
  "notes": "Venda com desconto especial",
  "createdAt": "2025-09-28T10:30:00Z",
  "updatedAt": "2025-09-28T10:30:00Z"
}
```

### Enums Implementados
```typescript
// Status da Venda
SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed', 
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Formas de Pagamento
PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card', 
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer'
}
```

## 🔄 Integração com Estoque

### Atualização Automática
- **Venda Registrada** → **Estoque Reduzido**
- **Movimento Criado** → **Histórico Atualizado**

### Dados do Movimento
```json
{
  "inventoryId": "inventory-id",
  "movementType": "out",
  "quantity": 15,
  "reference": "sale-id-12345",
  "reason": "Venda",
  "performedBy": "Sistema",
  "notes": "Venda registrada - ID: sale-12345"
}
```

## 📊 Relatórios Disponíveis (Firebase)

### Métodos Implementados
- `getTotalRevenue()` - Receita total por período
- `getTotalProfit()` - Lucro total por período  
- `getSalesVolumeByProduct()` - Volume vendido por produto
- `findByDateRange()` - Vendas por data
- `findByStatus()` - Vendas por status

## 🎯 Funcionalidades Avançadas

### 💡 **UX Inteligente**
- Auto-preenchimento de preços por produto
- Cálculos em tempo real
- Validação de estoque antes da venda
- Feedback visual para erros
- Formatação monetária brasileira

### 🛡️ **Validações de Segurança**
- Campos obrigatórios validados
- Email com formato correto
- Quantidades e preços positivos
- Produtos existentes apenas

### 📱 **Responsividade**
- Design mobile-first
- Tailwind CSS
- Layout adaptável
- Touch-friendly

## 🧪 **Teste da Aplicação**

### Cenário de Teste Completo:
1. **Adicionar Produto**: `/home/add-product`
2. **Adicionar Estoque**: `/home/add-stock` 
3. **Registrar Venda**: `/home/add-sale`
4. **Verificar**: Estoque reduzido automaticamente

### Casos de Uso:
- ✅ Venda com estoque suficiente
- ❌ Venda com estoque insuficiente (erro)
- ✅ Venda com preço personalizado
- ✅ Venda com dados do cliente
- ✅ Venda apenas com produto e quantidade

## 📱 **Navegação Atualizada**

- **Dashboard**: `/home`
- **Adicionar Produto**: `/home/add-product`
- **Adicionar Estoque**: `/home/add-stock`
- **Registrar Venda**: `/home/add-sale` ⭐ **NOVO**
- **Menu**: "Add Venda" disponível

## 🔐 **Collections Firebase**

1. **`products`** - Catálogo de produtos
2. **`inventories`** - Controle de estoque  
3. **`stock_movements`** - Histórico de movimentações
4. **`sales`** - Registro de vendas ⭐ **NOVO**

---

### 🎉 **Sistema Completo de Farm Management!**

✅ **Produtos** → ✅ **Estoque** → ✅ **Vendas** → 📊 **Relatórios**

*Desenvolvido com Angular 15, Firebase/Firestore, Clean Architecture e Tailwind CSS*
