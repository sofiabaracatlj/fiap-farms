import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { Product, ProductMetrics } from '../../domain/entities/product.entity';

export interface SalesDashboardData {
    topProfitableProducts: Product[];
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    salesTrends: {
        period: string;
        revenue: number;
        profit: number;
    }[];
    productMetrics: ProductMetrics[];
}

@Injectable({
    providedIn: 'root'
})
export class GetSalesDashboardDataUseCase {
    constructor(
        private productRepository: ProductRepository,
        private saleRepository: SaleRepository
    ) { }

    execute(startDate: Date, endDate: Date, limit: number = 10): Observable<SalesDashboardData> {
        return new Observable(observer => {
            // Buscar produtos mais lucrativos
            const topProducts$ = this.productRepository.getTopProfitableProducts(limit);

            // Buscar dados de receita e lucro
            const totalRevenue$ = this.saleRepository.getTotalRevenue(startDate, endDate);
            const totalProfit$ = this.saleRepository.getTotalProfit(startDate, endDate);

            // Combinar os dados
            Promise.all([
                topProducts$.toPromise(),
                totalRevenue$.toPromise(),
                totalProfit$.toPromise()
            ]).then(([products, revenue, profit]) => {
                const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

                const dashboardData: SalesDashboardData = {
                    topProfitableProducts: products || [],
                    totalRevenue: revenue || 0,
                    totalProfit: profit || 0,
                    profitMargin,
                    salesTrends: [], // TODO: Implementar tendências
                    productMetrics: [] // TODO: Implementar métricas por produto
                };

                observer.next(dashboardData);
                observer.complete();
            }).catch(error => {
                observer.error(error);
            });
        });
    }
}
