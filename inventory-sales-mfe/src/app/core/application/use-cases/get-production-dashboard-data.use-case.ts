import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductionRepository } from '../../domain/repositories/production.repository';
import { Production, ProductionMetrics, ProductionStatus } from '../../domain/entities/production.entity';

export interface ProductionDashboardData {
    waitingProductions: Production[];
    inProgressProductions: Production[];
    harvestedProductions: Production[];
    productionMetrics: ProductionMetrics;
    statusDistribution: {
        status: ProductionStatus;
        count: number;
        percentage: number;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class GetProductionDashboardDataUseCase {
    constructor(
        private productionRepository: ProductionRepository
    ) { }

    execute(startDate: Date, endDate: Date): Observable<ProductionDashboardData> {
        return new Observable(observer => {
            Promise.all([
                this.productionRepository.findByStatus(ProductionStatus.WAITING).toPromise(),
                this.productionRepository.findByStatus(ProductionStatus.IN_PROGRESS).toPromise(),
                this.productionRepository.findByStatus(ProductionStatus.HARVESTED).toPromise(),
                this.productionRepository.getProductionMetrics(startDate, endDate).toPromise(),
                this.productionRepository.getProductionByStatus().toPromise()
            ]).then(([waiting, inProgress, harvested, metrics, statusData]) => {
                const total = statusData?.reduce((sum, item) => sum + item.count, 0) || 0;

                const statusDistribution = statusData?.map(item => ({
                    status: item.status,
                    count: item.count,
                    percentage: total > 0 ? (item.count / total) * 100 : 0
                })) || [];

                const dashboardData: ProductionDashboardData = {
                    waitingProductions: waiting || [],
                    inProgressProductions: inProgress || [],
                    harvestedProductions: harvested || [],
                    productionMetrics: metrics || {
                        totalPlanned: 0,
                        totalInProgress: 0,
                        totalHarvested: 0,
                        totalCompleted: 0,
                        efficiency: 0,
                        period: { startDate, endDate }
                    },
                    statusDistribution
                };

                observer.next(dashboardData);
                observer.complete();
            }).catch(error => {
                observer.error(error);
            });
        });
    }
}
