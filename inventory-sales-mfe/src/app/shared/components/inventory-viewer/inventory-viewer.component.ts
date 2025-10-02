import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProductRepository } from '../../../core/domain/repositories/product.repository';
import { InventoryRepository } from '../../../core/domain/repositories/inventory.repository';
import { Product } from '../../../core/domain/entities/product.entity';
import { Inventory } from '../../../core/domain/entities/inventory.entity';

export interface ProductWithInventory {
    product: Product;
    inventories: Inventory[]; // Mudança: múltiplos inventários
    stockStatus: 'high' | 'medium' | 'low' | 'out';
    stockLevel: number;
    totalValue: number;
    totalStock: number; // Novo: soma total de todos os inventários
}

@Component({
    selector: 'app-inventory-viewer',
    templateUrl: './inventory-viewer.component.html',
    styleUrls: ['./inventory-viewer.component.css']
})
export class InventoryViewerComponent implements OnInit, OnDestroy {
    productsWithInventory$!: Observable<ProductWithInventory[]>;
    isLoading = true;
    error: string | null = null;
    searchTerm = '';
    sortBy: 'name' | 'stock' | 'value' = 'name';
    sortDirection: 'asc' | 'desc' = 'asc';
    filterBy: 'all' | 'low' | 'out' | 'high' = 'all';

    private subscriptions: Subscription[] = [];

    constructor(
        private productRepo: ProductRepository,
        private inventoryRepo: InventoryRepository
    ) { }

    ngOnInit(): void {
        this.loadInventoryData();
    }

    private loadInventoryData(): void {
        this.isLoading = true;
        this.error = null;

        console.log('📦 Carregando dados de produtos e estoque...');

        this.productsWithInventory$ = combineLatest([
            this.productRepo.findAll(),
            this.inventoryRepo.findAll()
        ]).pipe(
            map(([products, inventories]) => {
                console.log('📊 Dados carregados:', {
                    produtos: products.length,
                    inventarios: inventories.length
                });

                return products.map(product => {
                    // Buscar TODOS os inventários para este produto
                    const productInventories = inventories.filter(inv => inv.productId === product.id);
                    return this.createProductWithInventory(product, productInventories);
                });
            }),
            map(items => this.applyFiltersAndSort(items)),
            catchError(error => {
                console.error('❌ Erro ao carregar dados:', error);
                this.error = 'Erro ao carregar dados do estoque';
                this.isLoading = false;
                return [];
            })
        );

        const subscription = this.productsWithInventory$.subscribe({
            next: (data) => {
                this.isLoading = false;
                console.log('✅ Dados processados:', data.length, 'itens');
            },
            error: (error) => {
                console.error('❌ Erro na subscrição:', error);
                this.isLoading = false;
                this.error = 'Erro ao processar dados';
            }
        });

        this.subscriptions.push(subscription);
    }

    private createProductWithInventory(product: Product, inventories: Inventory[]): ProductWithInventory {
        // Calcular totais somando todos os inventários do produto
        const totalStock = inventories.reduce((sum, inv) => sum + inv.currentStock, 0);
        const minimumStock = inventories.length > 0 ? Math.min(...inventories.map(inv => inv.minimumStock)) : 0;
        const maximumStock = inventories.length > 0 ? Math.max(...inventories.map(inv => inv.maximumStock)) : 100;

        let stockStatus: 'high' | 'medium' | 'low' | 'out';
        let stockLevel: number;

        if (totalStock === 0) {
            stockStatus = 'out';
            stockLevel = 0;
        } else if (totalStock < minimumStock) {
            stockStatus = 'low';
            stockLevel = (totalStock / minimumStock) * 100;
        } else if (totalStock >= maximumStock * 0.8) {
            stockStatus = 'high';
            stockLevel = 100;
        } else {
            stockStatus = 'medium';
            stockLevel = (totalStock / maximumStock) * 100;
        }

        const totalValue = totalStock * product.unitPrice;

        console.log(`📦 Produto ${product.name}:`, {
            inventarios: inventories.length,
            estoqueTotal: totalStock,
            valor: totalValue
        });

        return {
            product,
            inventories,
            stockStatus,
            stockLevel: Math.min(stockLevel, 100),
            totalValue,
            totalStock
        };
    }

    private applyFiltersAndSort(items: ProductWithInventory[]): ProductWithInventory[] {
        let filteredItems = [...items];

        // Aplicar filtro de busca
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(item =>
                item.product.name.toLowerCase().includes(searchLower) ||
                item.product.description?.toLowerCase().includes(searchLower) ||
                item.product.category.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtro por status
        if (this.filterBy !== 'all') {
            filteredItems = filteredItems.filter(item => item.stockStatus === this.filterBy);
        }

        // Aplicar ordenação
        filteredItems.sort((a, b) => {
            let valueA: any, valueB: any;

            switch (this.sortBy) {
                case 'name':
                    valueA = a.product.name.toLowerCase();
                    valueB = b.product.name.toLowerCase();
                    break;
                case 'stock':
                    valueA = a.totalStock;
                    valueB = b.totalStock;
                    break;
                case 'value':
                    valueA = a.totalValue;
                    valueB = b.totalValue;
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filteredItems;
    }

    onSearchChange(): void {
        // A filtragem será aplicada automaticamente através do pipe
        this.loadInventoryData();
    }

    onSortChange(sortBy: 'name' | 'stock' | 'value'): void {
        if (this.sortBy === sortBy) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            this.sortDirection = 'asc';
        }
        this.loadInventoryData();
    }

    onFilterChange(filterBy: 'all' | 'low' | 'out' | 'high'): void {
        this.filterBy = filterBy;
        this.loadInventoryData();
    }

    refreshData(): void {
        console.log('🔄 Atualizando dados do estoque...');
        this.loadInventoryData();
    }

    getStockStatusColor(status: string): string {
        switch (status) {
            case 'high': return 'text-green-600';
            case 'medium': return 'text-blue-600';
            case 'low': return 'text-yellow-600';
            case 'out': return 'text-red-600';
            default: return 'text-gray-600';
        }
    }

    getStockStatusBg(status: string): string {
        switch (status) {
            case 'high': return 'bg-green-100';
            case 'medium': return 'bg-blue-100';
            case 'low': return 'bg-yellow-100';
            case 'out': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    }

    getStockStatusText(status: string): string {
        switch (status) {
            case 'high': return 'Estoque Alto';
            case 'medium': return 'Estoque Normal';
            case 'low': return 'Estoque Baixo';
            case 'out': return 'Sem Estoque';
            default: return 'Desconhecido';
        }
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date?: Date): string {
        if (!date) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    }

    getMinStock(inventories: Inventory[]): number {
        if (inventories.length === 0) return 0;
        return Math.min(...inventories.map(inv => inv.minimumStock));
    }

    getMaxStock(inventories: Inventory[]): number {
        if (inventories.length === 0) return 0;
        return Math.max(...inventories.map(inv => inv.maximumStock));
    }

    getNextExpiration(inventories: Inventory[]): Date | null {
        const validDates = inventories
            .map(inv => inv.expirationDate)
            .filter(date => date)
            .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime());

        return validDates.length > 0 ? validDates[0]! : null;
    }

    hasExpiringSoon(inventories: Inventory[]): boolean {
        return inventories.some(inv =>
            inv.expirationDate && this.isExpiringSoon(inv.expirationDate)
        );
    }

    isExpiringSoon(expirationDate: Date): boolean {
        if (!expirationDate) return false;
        const today = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Considera "vencendo em breve" se for em 30 dias ou menos
    }

    trackByProductId(index: number, item: ProductWithInventory): string {
        return item.product.id;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
