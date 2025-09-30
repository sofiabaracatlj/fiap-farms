import { Observable } from 'rxjs';
import { Production, ProductionStatus, ProductionMetrics } from '../entities/production.entity';

export abstract class ProductionRepository {
    abstract findAll(): Observable<Production[]>;
    abstract findById(id: string): Observable<Production | null>;
    abstract findByProductId(productId: string): Observable<Production[]>;
    abstract findByStatus(status: ProductionStatus): Observable<Production[]>;
    abstract findByDateRange(startDate: Date, endDate: Date): Observable<Production[]>;
    abstract create(production: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>): Observable<Production>;
    abstract update(id: string, production: Partial<Production>): Observable<Production>;
    abstract delete(id: string): Observable<boolean>;
    abstract getProductionMetrics(startDate: Date, endDate: Date): Observable<ProductionMetrics>;
    abstract getProductionByStatus(): Observable<{ status: ProductionStatus, count: number }[]>;
}
