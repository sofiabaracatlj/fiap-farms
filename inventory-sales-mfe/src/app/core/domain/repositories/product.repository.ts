import { Observable } from 'rxjs';
import { Product, ProductMetrics } from '../entities/product.entity';

export abstract class ProductRepository {
    abstract findAll(): Observable<Product[]>;
    abstract findById(id: string): Observable<Product | null>;
    abstract findByCategory(category: string): Observable<Product[]>;
    abstract create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product>;
    abstract update(id: string, product: Partial<Product>): Observable<Product>;
    abstract delete(id: string): Observable<boolean>;
    abstract getProductMetrics(productId: string, startDate: Date, endDate: Date): Observable<ProductMetrics>;
    abstract getTopProfitableProducts(limit: number): Observable<Product[]>;
}
