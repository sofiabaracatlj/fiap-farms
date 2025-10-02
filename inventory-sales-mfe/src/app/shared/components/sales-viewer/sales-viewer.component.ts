import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SaleRepository } from '../../../core/domain/repositories/sale.repository';
import { ProductRepository } from '../../../core/domain/repositories/product.repository';
import { Sale } from '../../../core/domain/entities/sale.entity';
import { Product } from '../../../core/domain/entities/product.entity';

export interface SaleWithProduct {
    sale: Sale;
    product: Product;
    profitAmount: number;
    profitMargin: number;
}

@Component({
    selector: 'app-sales-viewer',
    templateUrl: './sales-viewer.component.html',
    styleUrls: ['./sales-viewer.component.css']
})
export class SalesViewerComponent implements OnInit, OnDestroy {
    salesWithProducts$!: Observable<SaleWithProduct[]>;
    isLoading = true;
    error: string | null = null;
    searchTerm = '';
    sortBy: 'date' | 'customer' | 'total' | 'profit' = 'date';
    sortDirection: 'asc' | 'desc' = 'desc';
    filterBy: 'all' | 'completed' | 'pending' | 'cancelled' = 'all';
    filteredSales: SaleWithProduct[] = [];

    private subscriptions: Subscription[] = [];

    constructor(
        private saleRepo: SaleRepository,
        private productRepo: ProductRepository
    ) { }

    ngOnInit(): void {
        this.loadSalesData();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private loadSalesData(): void {
        this.isLoading = true;
        this.error = null;

        console.log('📊 Carregando dados de vendas...');

        // Primeiro carregar todas as vendas
        const salesSubscription = this.saleRepo.findAll().pipe(
            catchError(error => {
                console.error('❌ Erro ao carregar vendas:', error);
                this.error = 'Erro ao carregar dados de vendas. Tente novamente.';
                this.isLoading = false;
                return [];
            })
        ).subscribe({
            next: (sales) => {
                console.log('🎯 Vendas encontradas:', sales.length);
                if (sales.length === 0) {
                    this.filteredSales = [];
                    this.isLoading = false;
                    return;
                }

                // Carregar produtos para cada venda
                this.loadProductsForSales(sales);
            },
            error: (error) => {
                console.error('❌ Erro na subscription de vendas:', error);
                this.error = 'Erro ao processar dados de vendas.';
                this.isLoading = false;
            }
        });

        this.subscriptions.push(salesSubscription);
    }

    private loadProductsForSales(sales: Sale[]): void {
        const salesWithProducts: SaleWithProduct[] = [];
        let loadedCount = 0;

        sales.forEach(sale => {
            const productSubscription = this.productRepo.findById(sale.productId).subscribe({
                next: (product) => {
                    if (product) {
                        const saleWithProduct: SaleWithProduct = {
                            sale,
                            product,
                            profitAmount: this.calculateProfitAmount(sale, product),
                            profitMargin: this.calculateProfitMargin(sale, product)
                        };
                        salesWithProducts.push(saleWithProduct);
                    } else {
                        // Produto não encontrado, criar um placeholder
                        const placeholderProduct: Product = {
                            id: sale.productId,
                            name: 'Produto não encontrado',
                            category: 'N/A',
                            unitPrice: 0,
                            costPrice: 0,
                            profitMargin: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        const saleWithProduct: SaleWithProduct = {
                            sale,
                            product: placeholderProduct,
                            profitAmount: 0,
                            profitMargin: 0
                        };
                        salesWithProducts.push(saleWithProduct);
                    }

                    loadedCount++;
                    if (loadedCount === sales.length) {
                        // Todos os produtos foram carregados
                        this.filteredSales = salesWithProducts;
                        this.applySortAndFilter();
                        this.isLoading = false;
                        console.log('✅ Vendas com produtos carregadas:', salesWithProducts.length);
                    }
                },
                error: (error) => {
                    console.error('❌ Erro ao buscar produto:', error);
                    loadedCount++;
                    if (loadedCount === sales.length) {
                        this.filteredSales = salesWithProducts;
                        this.applySortAndFilter();
                        this.isLoading = false;
                    }
                }
            });

            this.subscriptions.push(productSubscription);
        });
    }

    private calculateProfitAmount(sale: Sale, product: Product): number {
        const costPerUnit = product.costPrice || 0;
        const totalCost = costPerUnit * sale.quantity;
        return sale.totalAmount - totalCost;
    }

    private calculateProfitMargin(sale: Sale, product: Product): number {
        if (sale.totalAmount === 0) return 0;
        const profitAmount = this.calculateProfitAmount(sale, product);
        return (profitAmount / sale.totalAmount) * 100;
    }

    onSearch(): void {
        this.applySortAndFilter();
    }

    onSortChange(): void {
        this.applySortAndFilter();
    }

    onFilterChange(): void {
        this.applySortAndFilter();
    }

    private applySortAndFilter(): void {
        let filtered = [...this.filteredSales];

        // Aplicar filtro de busca
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.product.name.toLowerCase().includes(term) ||
                item.sale.customerName?.toLowerCase().includes(term) ||
                item.sale.customerEmail?.toLowerCase().includes(term)
            );
        }

        // Aplicar filtro por status
        if (this.filterBy !== 'all') {
            filtered = filtered.filter(item => item.sale.status === this.filterBy);
        }

        // Aplicar ordenação
        filtered.sort((a, b) => {
            let compareValue = 0;

            switch (this.sortBy) {
                case 'date':
                    compareValue = new Date(a.sale.saleDate).getTime() - new Date(b.sale.saleDate).getTime();
                    break;
                case 'customer':
                    compareValue = (a.sale.customerName || '').localeCompare(b.sale.customerName || '');
                    break;
                case 'total':
                    compareValue = a.sale.totalAmount - b.sale.totalAmount;
                    break;
                case 'profit':
                    compareValue = a.profitAmount - b.profitAmount;
                    break;
            }

            return this.sortDirection === 'asc' ? compareValue : -compareValue;
        });

        this.filteredSales = filtered;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed':
                return 'Concluída';
            case 'pending':
                return 'Pendente';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    }

    getProfitColor(profitMargin: number): string {
        if (profitMargin > 20) return 'text-green-600';
        if (profitMargin > 10) return 'text-yellow-600';
        return 'text-red-600';
    }

    // Métodos para cálculos de resumo
    getTotalRevenue(): number {
        return this.filteredSales.reduce((sum, item) => sum + item.sale.totalAmount, 0);
    }

    getTotalProfit(): number {
        return this.filteredSales.reduce((sum, item) => sum + item.profitAmount, 0);
    }

    getAverageMargin(): number {
        if (this.filteredSales.length === 0) return 0;
        const totalMargin = this.filteredSales.reduce((sum, item) => sum + item.profitMargin, 0);
        return totalMargin / this.filteredSales.length;
    }
}
