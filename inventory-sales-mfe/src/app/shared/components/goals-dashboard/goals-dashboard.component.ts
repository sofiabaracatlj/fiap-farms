import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SaleRepository } from '../../../core/domain/repositories/sale.repository';
import { ProductRepository } from '../../../core/domain/repositories/product.repository';
// import { GoalsService } from '../../../core/application/services/goals.service';

interface GoalData {
    id: string;
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    progress: number;
    color: 'green' | 'blue' | 'yellow' | 'red';
}

@Component({
    selector: 'app-goals-dashboard',
    templateUrl: './goals-dashboard.component.html',
    styleUrls: ['./goals-dashboard.component.css']
})
export class GoalsDashboardComponent implements OnInit, OnDestroy {
    goals: GoalData[] = [
        {
            id: '1',
            title: 'Vendas Mensais',
            currentValue: 0,
            targetValue: 60000,
            unit: 'R$',
            progress: 0,
            color: 'green'
        },
        {
            id: '2',
            title: 'Total de Vendas (Quantidade)',
            currentValue: 0,
            targetValue: 50,
            unit: 'vendas',
            progress: 0,
            color: 'blue'
        },
        {
            id: '3',
            title: 'Lucro Mensal',
            currentValue: 0,
            targetValue: 20000,
            unit: 'R$',
            progress: 0,
            color: 'yellow'
        },
        {
            id: '4',
            title: 'Margem de Lucro',
            currentValue: 0,
            targetValue: 30,
            unit: '%',
            progress: 0,
            color: 'green'
        }
    ];

    overallProgress: number = 0;
    achievedGoalsCount: number = 0;
    isLoading: boolean = false;

    private subscriptions: Subscription[] = [];
    private currentMonth = new Date().getMonth();
    private currentYear = new Date().getFullYear();

    constructor(
        private saleRepo: SaleRepository,
        private productRepo: ProductRepository
    ) { }

    ngOnInit(): void {
        this.loadGoalsFromFirebase();
    }

    private loadGoalsFromFirebase(): void {
        this.isLoading = true;
        console.log('🎯 Carregando metas com dados reais do Firebase...');

        // Carregar vendas do mês atual
        const monthSales$ = this.saleRepo.findByMonthYear(this.currentMonth, this.currentYear);
        const monthRevenue$ = this.saleRepo.getMonthlyRevenue(this.currentMonth, this.currentYear);

        const salesSubscription = monthSales$.subscribe({
            next: (sales) => {
                console.log('📊 Vendas do mês carregadas:', sales.length);
                this.updateGoalsWithSalesData(sales);
            },
            error: (error) => {
                console.error('❌ Erro ao carregar vendas:', error);
                this.isLoading = false;
            }
        });

        const revenueSubscription = monthRevenue$.subscribe({
            next: (revenue) => {
                console.log('💰 Receita mensal carregada:', revenue);
                this.updateRevenueGoal(revenue);
                this.loadStatistics();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('❌ Erro ao carregar receita:', error);
                this.isLoading = false;
            }
        });

        this.subscriptions.push(salesSubscription, revenueSubscription);
    }

    private updateGoalsWithSalesData(sales: any[]): void {
        // Atualizar meta de quantidade de vendas
        const totalSales = sales.length;
        const salesGoal = this.goals.find(g => g.id === '2');
        if (salesGoal) {
            salesGoal.currentValue = totalSales;
            salesGoal.progress = Math.min(Math.round((totalSales / salesGoal.targetValue) * 100), 100);
        }

        // Calcular lucro total do mês
        const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
        const profitGoal = this.goals.find(g => g.id === '3');
        if (profitGoal) {
            profitGoal.currentValue = totalProfit;
            profitGoal.progress = Math.min(Math.round((totalProfit / profitGoal.targetValue) * 100), 100);
        }

        // Calcular margem de lucro média
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const marginGoal = this.goals.find(g => g.id === '4');
        if (marginGoal && totalRevenue > 0) {
            const profitMargin = (totalProfit / totalRevenue) * 100;
            marginGoal.currentValue = Math.round(profitMargin * 10) / 10; // Uma casa decimal
            marginGoal.progress = Math.min(Math.round((profitMargin / marginGoal.targetValue) * 100), 100);
        }

        console.log('🎯 Metas atualizadas com dados reais:', {
            vendas: totalSales,
            lucro: totalProfit,
            receita: totalRevenue,
            margem: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%'
        });
    }

    private updateRevenueGoal(revenue: number): void {
        const revenueGoal = this.goals.find(g => g.id === '1');
        if (revenueGoal) {
            revenueGoal.currentValue = revenue;
            revenueGoal.progress = Math.min(Math.round((revenue / revenueGoal.targetValue) * 100), 100);
        }
    }

    private loadStatistics(): void {
        this.overallProgress = this.getOverallProgress();
        this.achievedGoalsCount = this.getAchievedGoalsCount();
    }

    getOverallProgress(): number {
        if (this.goals.length === 0) return 0;
        const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
        return Math.round(totalProgress / this.goals.length);
    }

    getAchievedGoalsCount(): number {
        return this.goals.filter(goal => goal.progress >= 100).length;
    }

    // Method to refresh goals with current Firebase data
    initializeSampleGoals(): void {
        console.log('🔄 Atualizando metas com dados do Firebase...');
        this.loadGoalsFromFirebase();
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    ngOnDestroy(): void {
        // Cleanup todas as subscrições
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
