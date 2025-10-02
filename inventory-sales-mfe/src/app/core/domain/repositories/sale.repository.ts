import { Observable } from 'rxjs';
import { Sale, SaleStatus } from '../entities/sale.entity';

export abstract class SaleRepository {
    abstract findAll(): Observable<Sale[]>;
    abstract findById(id: string): Observable<Sale | null>;
    abstract findByProductId(productId: string): Observable<Sale[]>;
    abstract findByDateRange(startDate: Date, endDate: Date): Observable<Sale[]>;
    abstract findByMonthYear(month: number, year: number): Observable<Sale[]>;
    abstract findByStatus(status: SaleStatus): Observable<Sale[]>;
    abstract create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Observable<Sale>;
    abstract update(id: string, sale: Partial<Sale>): Observable<Sale>;
    abstract delete(id: string): Observable<boolean>;
    abstract getTotalRevenue(startDate: Date, endDate: Date): Observable<number>;
    abstract getTotalProfit(startDate: Date, endDate: Date): Observable<number>;
    abstract getSalesVolumeByProduct(startDate: Date, endDate: Date): Observable<{ productId: string, volume: number }[]>;
    abstract getMonthlyRevenue(month: number, year: number): Observable<number>;
    abstract getMonthlyProfit(month: number, year: number): Observable<number>;
    abstract getMonthlySalesCount(month: number, year: number): Observable<number>;
}
