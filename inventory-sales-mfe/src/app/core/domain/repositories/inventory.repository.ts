import { Observable } from 'rxjs';
import { Inventory, StockMovement, MovementType } from '../entities/inventory.entity';

export abstract class InventoryRepository {
    abstract findAll(): Observable<Inventory[]>;
    abstract findById(id: string): Observable<Inventory | null>;
    abstract findByProductId(productId: string): Observable<Inventory | null>;
    abstract findByProductIds(productIds: string[]): Observable<Inventory[]>;
    abstract findLowStockItems(): Observable<Inventory[]>;
    abstract findLowStockByProductIds(productIds: string[]): Observable<Inventory[]>;
    abstract create(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Observable<Inventory>;
    abstract update(id: string, inventory: Partial<Inventory>): Observable<Inventory>;
    abstract delete(id: string): Observable<boolean>;
    abstract updateStock(inventoryId: string, quantity: number, movementType: MovementType): Observable<Inventory>;
    abstract addStock(inventoryId: string, quantity: number, unitPrice?: number): Observable<Inventory>;
    abstract addStockMovement(movement: Omit<StockMovement, 'id' | 'performedAt'>): Observable<StockMovement>;
}

export abstract class StockMovementRepository {
    abstract findAll(): Observable<StockMovement[]>;
    abstract findByInventoryId(inventoryId: string): Observable<StockMovement[]>;
    abstract findByDateRange(startDate: Date, endDate: Date): Observable<StockMovement[]>;
    abstract create(movement: Omit<StockMovement, 'id'>): Observable<StockMovement>;
}
