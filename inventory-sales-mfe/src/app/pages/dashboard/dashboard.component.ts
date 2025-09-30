import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, of, timer } from 'rxjs';
import { map, timeout, catchError, tap } from 'rxjs/operators';
import { ProductRepository } from '../../core/domain/repositories/product.repository';
import { InventoryRepository } from '../../core/domain/repositories/inventory.repository';
import { SaleRepository } from '../../core/domain/repositories/sale.repository';
import { Product } from '../../core/domain/entities/product.entity';
import { Inventory } from '../../core/domain/entities/inventory.entity';
import { Sale } from '../../core/domain/entities/sale.entity';
import { MockDataService } from '../../core/services/mock-data.service';
import { SessionAuthService } from '../../core/services/session-auth.service';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
    totalProducts: number;
    totalInventoryValue: number;
    totalSales: number;
    totalRevenue: number;
    lowStockProducts: number;
    todaySales: number;
    weeklyGrowth: number;
    topSellingProduct: string;
    averagePrice: number;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    metrics$!: Observable<DashboardMetrics>;
    loading = true;
    error: string | null = null;
    lastUpdate = new Date();

    constructor(
        private productRepo: ProductRepository,
        private inventoryRepo: InventoryRepository,
        private saleRepo: SaleRepository,
        private mockDataService: MockDataService,
        private sessionAuthService: SessionAuthService
    ) { }

    async ngOnInit() {
        console.log('Dashboard - Inicializando...');

        // Inicializar autenticação do sessionStorage
        try {
            console.log('Dashboard - Inicializando autenticação...');
            await this.sessionAuthService.initializeAuthFromSession();
            console.log('Dashboard - Autenticação inicializada com sucesso');
        } catch (error) {
            console.error('Dashboard - Erro ao inicializar autenticação:', error);
        }

        this.loadDashboardData();

        // Atualizar a cada 30 segundos se estivermos usando Firebase
        if (environment.useFirebase) {
            timer(0, 30000).subscribe(() => {
                this.loadDashboardData();
            });
        }
    }

    private loadDashboardData() {
        console.log('Dashboard - Carregando dados...');
        this.loading = true;
        this.error = null;

        if (!environment.useFirebase) {
            // Usar dados mock
            console.log('Dashboard - Usando dados mock');
            this.loadMockData();
            return;
        }

        // Carregar dados do Firebase com timeout e retry
        const products$ = this.productRepo.findAll().pipe(
            timeout(10000),
            catchError(error => {
                console.error('Dashboard - Erro ao carregar produtos:', error);
                return of([]);
            })
        );

        const inventory$ = this.inventoryRepo.findAll().pipe(
            timeout(10000),
            catchError(error => {
                console.error('Dashboard - Erro ao carregar inventário:', error);
                return of([]);
            })
        );

        const sales$ = this.saleRepo.findAll().pipe(
            timeout(10000),
            catchError(error => {
                console.error('Dashboard - Erro ao carregar vendas:', error);
                return of([]);
            })
        );

        this.metrics$ = combineLatest([products$, inventory$, sales$]).pipe(
            map(([products, inventory, sales]) => {
                console.log('Dashboard - Calculando métricas...', {
                    products: products.length,
                    inventory: inventory.length,
                    sales: sales.length
                });

                return this.calculateMetrics(products, inventory, sales);
            }),
            tap(() => {
                this.loading = false;
                this.lastUpdate = new Date();
                console.log('Dashboard - Métricas calculadas com sucesso');
            }),
            catchError(error => {
                console.error('Dashboard - Erro geral:', error);
                this.error = 'Erro ao carregar dados do dashboard';
                this.loading = false;
                return of(this.getEmptyMetrics());
            })
        );
    }

    private loadMockData() {
        const products = this.mockDataService.getProducts();
        const inventory = this.mockDataService.getInventories();
        const sales = this.mockDataService.getSales();

        // Aguardar os observables resolverem antes de calcular métricas
        combineLatest([products, inventory, sales]).subscribe(([productsData, inventoryData, salesData]) => {
            this.metrics$ = of(this.calculateMetrics(productsData, inventoryData, salesData));
            this.loading = false;
            console.log('Dashboard - Dados mock carregados');
        });
    }

    private calculateMetrics(products: Product[], inventory: Inventory[], sales: Sale[]): DashboardMetrics {
        const totalProducts = products.length;

        // Valor total do estoque
        const totalInventoryValue = inventory.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (item.currentStock * (product?.unitPrice || 0));
        }, 0);

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);

        // Produtos com estoque baixo (menos que o mínimo)
        const lowStockProducts = inventory.filter(item => item.currentStock < item.minimumStock).length;

        // Vendas de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySales = sales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            saleDate.setHours(0, 0, 0, 0);
            return saleDate.getTime() === today.getTime();
        }).length;

        // Crescimento semanal (simulado)
        const weeklyGrowth = totalSales > 0 ? Math.random() * 20 + 5 : 0;

        // Produto mais vendido
        const productSales = new Map<string, number>();
        sales.forEach(sale => {
            const current = productSales.get(sale.productId) || 0;
            productSales.set(sale.productId, current + sale.quantity);
        });

        let topSellingProduct = 'Nenhum';
        let maxSales = 0;
        productSales.forEach((quantity, productId) => {
            if (quantity > maxSales) {
                maxSales = quantity;
                const product = products.find(p => p.id === productId);
                topSellingProduct = product?.name || 'Produto não encontrado';
            }
        });

        // Preço médio dos produtos
        const averagePrice = products.length > 0
            ? products.reduce((total, product) => total + product.unitPrice, 0) / products.length
            : 0;

        return {
            totalProducts,
            totalInventoryValue,
            totalSales,
            totalRevenue,
            lowStockProducts,
            todaySales,
            weeklyGrowth,
            topSellingProduct,
            averagePrice
        };
    }

    private getEmptyMetrics(): DashboardMetrics {
        return {
            totalProducts: 0,
            totalInventoryValue: 0,
            totalSales: 0,
            totalRevenue: 0,
            lowStockProducts: 0,
            todaySales: 0,
            weeklyGrowth: 0,
            topSellingProduct: 'Nenhum',
            averagePrice: 0
        };
    }

    refresh() {
        console.log('Dashboard - Refresh manual solicitado');
        this.loadDashboardData();
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatPercentage(value: number): string {
        return `${value.toFixed(1)}%`;
    }
}
