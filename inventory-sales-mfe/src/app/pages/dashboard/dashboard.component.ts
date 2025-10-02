import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest, of, timer, Subscription } from 'rxjs';
import { map, timeout, catchError, tap, switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ProductRepository } from '../../core/domain/repositories/product.repository';
import { InventoryRepository } from '../../core/domain/repositories/inventory.repository';
import { SaleRepository } from '../../core/domain/repositories/sale.repository';
import { Product } from '../../core/domain/entities/product.entity';
import { Inventory } from '../../core/domain/entities/inventory.entity';
import { Sale, SaleStatus } from '../../core/domain/entities/sale.entity';
import { SessionAuthService } from '../../core/services/session-auth.service';
import { environment } from '../../../environments/environment';

export interface TopProduct {
    product: Product;
    quantity: number;
    revenue: number;
}

export interface LowStockItem {
    product: Product;
    inventory: Inventory;
}

export interface MonthlyMetrics {
    month: number;
    year: number;
    monthName: string;
    salesCount: number;
    revenue: number;
    profit: number;
    averageTicket: number;
    growthPercentage: number;
}

export interface DashboardData {
    totalProducts: number;
    totalInventoryValue: number;
    lowStockItems: number;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    topProducts: TopProduct[];
    lowStockProducts: LowStockItem[];
    recentSales: Sale[];
    currentMonth: MonthlyMetrics;
    monthlyHistory: MonthlyMetrics[];
    selectedMonth: MonthlyMetrics;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    dashboardData$!: Observable<DashboardData>;
    isLoading = true;
    error: string | null = null;
    lastUpdate = new Date();
    selectedMonth = new Date().getMonth();
    selectedYear = new Date().getFullYear();
    Math = Math;

    private subscriptions: Subscription[] = [];
    private timerSubscription?: Subscription;

    constructor(
        private productRepo: ProductRepository,
        private inventoryRepo: InventoryRepository,
        private saleRepo: SaleRepository,
        private sessionAuthService: SessionAuthService,
        private location: Location
    ) { }

    async ngOnInit() {
        console.log('🔥 FIAP Farms Dashboard - Conectando ao Firebase...');
        console.log('📊 Projeto Firebase:', environment.firebase.projectId);
        console.log('🌍 Ambiente:', environment.app.environment);

        // Inicializar autenticação do sessionStorage
        try {
            console.log('🔐 Inicializando autenticação...');
            await this.sessionAuthService.initializeAuthFromSession();
            console.log('✅ Autenticação inicializada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar autenticação:', error);
        }

        this.loadDashboardData();

        // Atualizar dados com consultas filtradas do Firebase a cada 30 segundos
        timer(30000, 30000).subscribe(() => {
            console.log('🔄 Timer executando refresh automático...');
            this.loadDashboardData();
        });
    }

    private loadDashboardData() {
        console.log('🔍 INICIANDO carregamento de dados filtrados em paralelo do Firebase...');
        console.log('📅 Mês/Ano selecionado:', this.getMonthName(this.selectedMonth), this.selectedYear);
        this.isLoading = true;
        this.error = null;

        console.log('🚀 Criando observables para consultas paralelas...');

        // Executar todas as consultas em paralelo - SEM dependências entre elas
        const allProducts$ = this.productRepo.findAll().pipe(
            tap(() => console.log('🔍 Produtos carregados')),
            timeout(10000),
            catchError(error => {
                console.error('❌ Erro ao carregar produtos:', error);
                return of([]);
            })
        );

        const allInventory$ = this.inventoryRepo.findAll().pipe(
            tap(() => console.log('🔍 Inventário carregado')),
            timeout(10000),
            catchError(error => {
                console.error('❌ Erro ao carregar inventário:', error);
                return of([]);
            })
        );

        const lowStockInventory$ = this.inventoryRepo.findLowStockItems().pipe(
            tap(() => console.log('🔍 Itens com estoque baixo carregados')),
            timeout(10000),
            catchError(error => {
                console.error('❌ Erro ao carregar itens com estoque baixo:', error);
                return of([]);
            })
        );

        // Vendas do mês atual - consulta independente
        const currentMonthSales$ = this.saleRepo.findByMonthYear(this.selectedMonth, this.selectedYear).pipe(
            tap(() => console.log('🔍 Vendas do mês carregadas')),
            timeout(10000),
            catchError(error => {
                console.error('❌ Erro ao carregar vendas do mês atual:', error);
                return of([]);
            })
        );

        // Receita mensal já calculada - consulta independente
        const monthlyRevenue$ = this.saleRepo.getMonthlyRevenue(this.selectedMonth, this.selectedYear).pipe(
            tap(() => console.log('🔍 Receita mensal carregada')),
            timeout(10000),
            catchError(error => {
                console.error('❌ Erro ao carregar receita mensal:', error);
                return of(0);
            })
        );

        console.log('🔗 Combinando todas as consultas com combineLatest...');

        // Todas as consultas executam simultaneamente
        this.dashboardData$ = combineLatest([
            allProducts$,
            allInventory$,
            lowStockInventory$,
            currentMonthSales$,
            monthlyRevenue$
        ]).pipe(
            tap(() => console.log('✅ Todas as consultas completadas, processando dados...')),
            map(([allProducts, allInventory, lowStockInventory, currentMonthSales, monthlyRevenue]) => {
                console.log('📊 Calculando métricas com dados carregados em paralelo...', {
                    allProducts: allProducts.length,
                    allInventory: allInventory.length,
                    lowStockItems: lowStockInventory.length,
                    currentMonthSales: currentMonthSales.length,
                    monthlyRevenue: monthlyRevenue,
                    month: this.getMonthName(this.selectedMonth),
                    year: this.selectedYear
                });

                return this.calculateOptimizedDashboardData(
                    allProducts,
                    lowStockInventory,
                    allInventory,
                    currentMonthSales,
                    monthlyRevenue
                );
            }),
            tap((data) => {
                // SEMPRE para o loading quando os dados são processados
                this.isLoading = false;
                this.lastUpdate = new Date();
                this.error = null; // Limpar qualquer erro anterior
                console.log('✅ Dashboard carregado com sucesso:', {
                    totalProducts: data.totalProducts,
                    totalSales: data.totalSales,
                    totalRevenue: data.totalRevenue
                });
            }),
            catchError(error => {
                // SEMPRE para o loading em caso de erro
                console.error('❌ Erro geral no dashboard:', error);
                this.error = 'Erro ao carregar dados do dashboard. Verifique sua conexão com o Firebase.';
                this.isLoading = false;
                return of(this.getEmptyData());
            })
        );

        // Forçar a subscrição para garantir que as requisições sejam executadas
        console.log('🔥 Executando subscrição manual para iniciar requisições...');
        const manualSubscription = this.dashboardData$.subscribe({
            next: (data) => {
                console.log('📈 Dashboard data processado via subscrição:', {
                    produtos: data.totalProducts,
                    vendas: data.totalSales,
                    receita: data.totalRevenue
                });
            },
            error: (error) => {
                console.error('❌ Erro na subscrição do dashboard:', error);
                this.isLoading = false;
                this.error = 'Erro ao processar dados do dashboard';
            }
        });

        // Armazenar subscrição para cleanup
        this.subscriptions.push(manualSubscription);
    }



    private calculateOptimizedDashboardData(
        products: Product[],
        lowStockInventory: Inventory[],
        allInventory: Inventory[],
        currentMonthSales: Sale[],
        monthlyRevenue: number
    ): DashboardData {
        console.log('⚡ Calculando métricas com dados já filtrados do Firebase...');

        const totalProducts = products.length;

        // Valor total do estoque (usando inventário completo)
        const totalInventoryValue = allInventory.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (item.currentStock * (product?.unitPrice || 0));
        }, 0);

        // Métricas baseadas APENAS nas vendas do mês atual (já filtradas)
        const totalSales = currentMonthSales.length;
        const totalRevenue = monthlyRevenue || currentMonthSales.reduce((total, sale) => total + sale.totalAmount, 0);
        const totalProfit = currentMonthSales.reduce((total, sale) => total + sale.profit, 0);

        // Produtos com estoque baixo (já filtrados do Firebase)
        const lowStockItems = lowStockInventory.length;

        // Top produtos mais vendidos do mês atual (usando dados já filtrados)
        const productSales = new Map<string, { quantity: number; revenue: number }>();
        currentMonthSales.forEach(sale => {
            const current = productSales.get(sale.productId) || { quantity: 0, revenue: 0 };
            productSales.set(sale.productId, {
                quantity: current.quantity + sale.quantity,
                revenue: current.revenue + sale.totalAmount
            });
        });

        const topProducts: TopProduct[] = Array.from(productSales.entries())
            .map(([productId, data]) => {
                const product = products.find(p => p.id === productId);
                return product ? {
                    product,
                    quantity: data.quantity,
                    revenue: data.revenue
                } : null;
            })
            .filter((item): item is TopProduct => item !== null)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Produtos com estoque baixo detalhados (usando dados já filtrados)
        const lowStockProducts: LowStockItem[] = lowStockInventory
            .map(inv => {
                const product = products.find(p => p.id === inv.productId);
                return product ? { product, inventory: inv } : null;
            })
            .filter((item): item is LowStockItem => item !== null)
            .slice(0, 10);

        // Vendas recentes do mês atual (últimas 10, já filtradas)
        const recentSales = currentMonthSales
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
            .slice(0, 10);

        // Métricas do mês selecionado (usando dados já filtrados)
        const selectedMonthMetrics = this.getOptimizedSelectedMonthMetrics(currentMonthSales, totalRevenue, totalProfit);

        console.log('⚡ Métricas otimizadas calculadas:', {
            totalSales,
            totalRevenue,
            totalProfit,
            topProductsCount: topProducts.length,
            lowStockItems,
            optimizedQueries: 'Firebase filtered queries used'
        });

        return {
            totalProducts,
            totalInventoryValue,
            lowStockItems,
            totalSales,
            totalRevenue,
            totalProfit,
            topProducts,
            lowStockProducts,
            recentSales,
            currentMonth: selectedMonthMetrics, // Usando o mês selecionado como "atual"
            monthlyHistory: [selectedMonthMetrics], // Apenas o mês atual para melhor performance
            selectedMonth: selectedMonthMetrics
        };
    }

    private getOptimizedSelectedMonthMetrics(monthSales: Sale[], totalRevenue: number, totalProfit: number): MonthlyMetrics {
        const averageTicket = monthSales.length > 0 ? totalRevenue / monthSales.length : 0;

        // Para calcular crescimento, precisaríamos dos dados do mês anterior
        // Por enquanto, vamos deixar como 0 para manter a performance
        const growthPercentage = 0;

        return {
            month: this.selectedMonth,
            year: this.selectedYear,
            monthName: this.getMonthName(this.selectedMonth),
            salesCount: monthSales.length,
            revenue: totalRevenue,
            profit: totalProfit,
            averageTicket,
            growthPercentage
        };
    }

    private calculateCurrentMonthDashboardData(products: Product[], inventory: Inventory[], currentMonthSales: Sale[]): DashboardData {
        console.log('📊 Calculando métricas apenas do mês atual...');

        const totalProducts = products.length;

        // Valor total do estoque
        const totalInventoryValue = inventory.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (item.currentStock * (product?.unitPrice || 0));
        }, 0);

        // Métricas baseadas APENAS nas vendas do mês atual
        const totalSales = currentMonthSales.length;
        const totalRevenue = currentMonthSales.reduce((total, sale) => total + sale.totalAmount, 0);
        const totalProfit = currentMonthSales.reduce((total, sale) => total + sale.profit, 0);

        // Produtos com estoque baixo (sempre atual)
        const lowStockItems = inventory.filter(item => item.currentStock < item.minimumStock).length;

        // Top produtos mais vendidos do mês atual
        const productSales = new Map<string, { quantity: number; revenue: number }>();
        currentMonthSales.forEach(sale => {
            const current = productSales.get(sale.productId) || { quantity: 0, revenue: 0 };
            productSales.set(sale.productId, {
                quantity: current.quantity + sale.quantity,
                revenue: current.revenue + sale.totalAmount
            });
        });

        const topProducts: TopProduct[] = Array.from(productSales.entries())
            .map(([productId, data]) => {
                const product = products.find(p => p.id === productId);
                return product ? {
                    product,
                    quantity: data.quantity,
                    revenue: data.revenue
                } : null;
            })
            .filter((item): item is TopProduct => item !== null)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Produtos com estoque baixo detalhados
        const lowStockProducts: LowStockItem[] = inventory
            .filter(item => item.currentStock < item.minimumStock)
            .map(inv => {
                const product = products.find(p => p.id === inv.productId);
                return product ? { product, inventory: inv } : null;
            })
            .filter((item): item is LowStockItem => item !== null)
            .slice(0, 10);

        // Vendas recentes do mês atual (últimas 10)
        const recentSales = currentMonthSales
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
            .slice(0, 10);

        // Métricas do mês selecionado
        const selectedMonthMetrics = this.getSelectedMonthMetrics(currentMonthSales);

        console.log('📈 Métricas calculadas:', {
            totalSales,
            totalRevenue,
            totalProfit,
            topProductsCount: topProducts.length,
            lowStockItems
        });

        return {
            totalProducts,
            totalInventoryValue,
            lowStockItems,
            totalSales,
            totalRevenue,
            totalProfit,
            topProducts,
            lowStockProducts,
            recentSales,
            currentMonth: selectedMonthMetrics, // Usando o mês selecionado como "atual"
            monthlyHistory: [selectedMonthMetrics], // Apenas o mês atual
            selectedMonth: selectedMonthMetrics
        };
    }

    private calculateDashboardData(products: Product[], inventory: Inventory[], sales: Sale[], monthSales?: Sale[]): DashboardData {
        const totalProducts = products.length;

        // Valor total do estoque
        const totalInventoryValue = inventory.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (item.currentStock * (product?.unitPrice || 0));
        }, 0);

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((total, sale) => total + sale.totalAmount, 0);
        const totalProfit = sales.reduce((total, sale) => total + sale.profit, 0);

        // Produtos com estoque baixo (menos que o mínimo)
        const lowStockItems = inventory.filter(item => item.currentStock < item.minimumStock).length;

        // Top produtos mais vendidos
        const productSales = new Map<string, { quantity: number; revenue: number }>();
        sales.forEach(sale => {
            const current = productSales.get(sale.productId) || { quantity: 0, revenue: 0 };
            productSales.set(sale.productId, {
                quantity: current.quantity + sale.quantity,
                revenue: current.revenue + sale.totalAmount
            });
        });

        const topProducts: TopProduct[] = Array.from(productSales.entries())
            .map(([productId, data]) => {
                const product = products.find(p => p.id === productId);
                return product ? {
                    product,
                    quantity: data.quantity,
                    revenue: data.revenue
                } : null;
            })
            .filter((item): item is TopProduct => item !== null)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Produtos com estoque baixo detalhados
        const lowStockProducts: LowStockItem[] = inventory
            .filter(item => item.currentStock < item.minimumStock)
            .map(inv => {
                const product = products.find(p => p.id === inv.productId);
                return product ? { product, inventory: inv } : null;
            })
            .filter((item): item is LowStockItem => item !== null)
            .slice(0, 10);

        // Vendas recentes (últimas 10)
        const recentSales = sales
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
            .slice(0, 10);

        // Calcular métricas mensais
        const currentMonthSales = monthSales || sales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate.getMonth() === this.selectedMonth && saleDate.getFullYear() === this.selectedYear;
        });

        const monthlyHistory = this.calculateMonthlyMetrics(sales);
        const currentMonth = this.getCurrentMonthMetrics(sales);
        const selectedMonth = this.getSelectedMonthMetrics(currentMonthSales);

        return {
            totalProducts,
            totalInventoryValue,
            lowStockItems,
            totalSales,
            totalRevenue,
            totalProfit,
            topProducts,
            lowStockProducts,
            recentSales,
            currentMonth,
            monthlyHistory,
            selectedMonth
        };
    }

    private getEmptyData(): DashboardData {
        const emptyMonth: MonthlyMetrics = {
            month: this.selectedMonth,
            year: this.selectedYear,
            monthName: this.getMonthName(this.selectedMonth),
            salesCount: 0,
            revenue: 0,
            profit: 0,
            averageTicket: 0,
            growthPercentage: 0
        };

        console.log('📊 Retornando dados vazios para:', emptyMonth.monthName, emptyMonth.year);

        return {
            totalProducts: 0,
            totalInventoryValue: 0,
            lowStockItems: 0,
            totalSales: 0,
            totalRevenue: 0,
            totalProfit: 0,
            topProducts: [],
            lowStockProducts: [],
            recentSales: [],
            currentMonth: emptyMonth,
            monthlyHistory: [emptyMonth],
            selectedMonth: emptyMonth
        };
    }

    private calculateMonthlyMetrics(sales: Sale[]): MonthlyMetrics[] {
        const monthlyData = new Map<string, { sales: Sale[], month: number, year: number }>();

        // Agrupar vendas por mês
        sales.forEach(sale => {
            const saleDate = new Date(sale.saleDate);
            const month = saleDate.getMonth();
            const year = saleDate.getFullYear();
            const key = `${year}-${month}`;

            if (!monthlyData.has(key)) {
                monthlyData.set(key, { sales: [], month, year });
            }
            monthlyData.get(key)?.sales.push(sale);
        });

        // Calcular métricas para cada mês
        const metrics: MonthlyMetrics[] = [];

        // Gerar últimos 12 meses
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;

            const monthSales = monthlyData.get(key)?.sales || [];
            const revenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const profit = monthSales.reduce((sum, sale) => sum + sale.profit, 0);
            const averageTicket = monthSales.length > 0 ? revenue / monthSales.length : 0;

            // Calcular crescimento em relação ao mês anterior
            let growthPercentage = 0;
            if (i < 11) {
                const prevMetrics = metrics[metrics.length - 1];
                if (prevMetrics && prevMetrics.revenue > 0) {
                    growthPercentage = ((revenue - prevMetrics.revenue) / prevMetrics.revenue) * 100;
                }
            }

            metrics.push({
                month,
                year,
                monthName: this.getMonthName(month),
                salesCount: monthSales.length,
                revenue,
                profit,
                averageTicket,
                growthPercentage
            });
        }

        return metrics;
    }

    private getCurrentMonthMetrics(sales: Sale[]): MonthlyMetrics {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthSales = sales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });

        const revenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const profit = monthSales.reduce((sum, sale) => sum + sale.profit, 0);
        const averageTicket = monthSales.length > 0 ? revenue / monthSales.length : 0;

        // Calcular crescimento em relação ao mês anterior
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthSales = sales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
        });

        const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const growthPercentage = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        return {
            month: currentMonth,
            year: currentYear,
            monthName: this.getMonthName(currentMonth),
            salesCount: monthSales.length,
            revenue,
            profit,
            averageTicket,
            growthPercentage
        };
    }

    private getSelectedMonthMetrics(monthSales: Sale[]): MonthlyMetrics {
        const revenue = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const profit = monthSales.reduce((sum, sale) => sum + sale.profit, 0);
        const averageTicket = monthSales.length > 0 ? revenue / monthSales.length : 0;

        // Para calcular crescimento, precisaríamos dos dados do mês anterior
        // Por enquanto, vamos deixar como 0
        const growthPercentage = 0;

        return {
            month: this.selectedMonth,
            year: this.selectedYear,
            monthName: this.getMonthName(this.selectedMonth),
            salesCount: monthSales.length,
            revenue,
            profit,
            averageTicket,
            growthPercentage
        };
    }

    private getMonthName(month: number): string {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return monthNames[month];
    }

    onMonthChange(month: number, year: number) {
        console.log('📅 Alterando para mês:', this.getMonthName(month), year);
        this.selectedMonth = month;
        this.selectedYear = year;
        this.loadDashboardData(); // Recarrega apenas os dados do novo mês selecionado
    }

    refresh() {
        console.log('🔄 Atualizando dados com consultas paralelas:', this.getMonthName(this.selectedMonth), this.selectedYear);
        this.loadDashboardData();
    }

    goBack() {
        this.location.back();
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    formatPercentage(value: number): string {
        return `${value.toFixed(1)}%`;
    }

    // Método para verificar conexão Firebase
    async checkFirebaseConnection() {
        console.log('🔍 VERIFICANDO CONEXÃO FIREBASE...');
        console.log('📋 Configuração atual:');
        console.log('- Project ID:', environment.firebase.projectId);
        console.log('- Auth Domain:', environment.firebase.authDomain);
        console.log('- Use Firebase:', environment.useFirebase);

        try {
            console.log('🔍 Testando conexão com collections...');

            // Testar products
            const products$ = this.productRepo.findAll();
            products$.subscribe({
                next: (products) => {
                    console.log('✅ Products collection - OK:', products.length, 'produtos');
                },
                error: (error) => {
                    console.error('❌ Products collection - ERRO:', error);
                }
            });

            // Testar inventories
            const inventory$ = this.inventoryRepo.findAll();
            inventory$.subscribe({
                next: (inventories) => {
                    console.log('✅ Inventories collection - OK:', inventories.length, 'itens');
                },
                error: (error) => {
                    console.error('❌ Inventories collection - ERRO:', error);
                }
            });

            // Testar sales
            const sales$ = this.saleRepo.findAll();
            sales$.subscribe({
                next: (sales) => {
                    console.log('✅ Sales collection - OK:', sales.length, 'vendas');
                },
                error: (error) => {
                    console.error('❌ Sales collection - ERRO:', error);
                }
            });

        } catch (error) {
            console.error('❌ Erro geral na verificação:', error);
        }
    }

    ngOnDestroy() {
        // Cleanup todas as subscrições
        this.subscriptions.forEach(sub => sub.unsubscribe());
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }
}
