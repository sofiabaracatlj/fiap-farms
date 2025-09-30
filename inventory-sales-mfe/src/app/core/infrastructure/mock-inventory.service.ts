import { Injectable, NgZone } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Inventory, StockMovement, MovementType } from '../domain/entities/inventory.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';

@Injectable({
    providedIn: 'root'
})
export class MockInventoryService implements InventoryRepository {
    private inventories: Inventory[] = [];
    private stockMovements: StockMovement[] = [];

    constructor(private ngZone: NgZone) { }

    findAll(): Observable<Inventory[]> {
        console.log('MockInventoryService - findAll chamado');
        return of(this.inventories).pipe(delay(300));
    }

    findById(id: string): Observable<Inventory | null> {
        console.log('MockInventoryService - findById:', id);
        const inventory = this.inventories.find(inv => inv.id === id) || null;
        return of(inventory).pipe(delay(200));
    }

    findByProductId(productId: string): Observable<Inventory | null> {
        console.log('MockInventoryService - findByProductId:', productId);
        const inventory = this.inventories.find(inv => inv.productId === productId) || null;
        return of(inventory).pipe(delay(200));
    }

    findLowStockItems(): Observable<Inventory[]> {
        console.log('MockInventoryService - findLowStockItems');
        const lowStock = this.inventories.filter(inv => inv.currentStock <= inv.minimumStock);
        return of(lowStock).pipe(delay(300));
    }

    create(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Observable<Inventory> {
        console.log('MockInventoryService - create:', inventory);

        const newInventory: Inventory = {
            ...inventory,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.inventories.push(newInventory);
        console.log('MockInventoryService - Inventory criado:', newInventory);

        return of(newInventory).pipe(delay(400));
    }

    update(id: string, inventory: Partial<Inventory>): Observable<Inventory> {
        console.log('MockInventoryService - update:', id, inventory);

        const index = this.inventories.findIndex(inv => inv.id === id);
        if (index === -1) {
            return throwError(() => new Error('Inventory não encontrado'));
        }

        this.inventories[index] = {
            ...this.inventories[index],
            ...inventory,
            updatedAt: new Date()
        };

        console.log('MockInventoryService - Inventory atualizado:', this.inventories[index]);
        return of(this.inventories[index]).pipe(delay(300));
    }

    delete(id: string): Observable<boolean> {
        console.log('MockInventoryService - delete:', id);

        const index = this.inventories.findIndex(inv => inv.id === id);
        if (index === -1) {
            return of(false);
        }

        this.inventories.splice(index, 1);
        console.log('MockInventoryService - Inventory deletado');
        return of(true).pipe(delay(200));
    }

    updateStock(inventoryId: string, quantity: number, movementType: MovementType): Observable<Inventory> {
        console.log('MockInventoryService - updateStock:', inventoryId, quantity, movementType);

        const inventory = this.inventories.find(inv => inv.id === inventoryId);
        if (!inventory) {
            return throwError(() => new Error('Inventory não encontrado'));
        }

        if (movementType === MovementType.IN) {
            inventory.currentStock += quantity;
        } else if (movementType === MovementType.OUT) {
            inventory.currentStock -= quantity;
            if (inventory.currentStock < 0) {
                inventory.currentStock = 0;
            }
        } else { // ADJUSTMENT
            inventory.currentStock = quantity;
        }

        inventory.lastStockUpdate = new Date();
        inventory.updatedAt = new Date();

        console.log('MockInventoryService - Stock atualizado:', inventory);
        return of(inventory).pipe(delay(300));
    }

    addStock(inventoryId: string, quantity: number, unitPrice?: number): Observable<Inventory> {
        console.log('MockInventoryService - addStock:', inventoryId, quantity, unitPrice);

        const inventory = this.inventories.find(inv => inv.id === inventoryId);
        if (!inventory) {
            return throwError(() => new Error('Inventory não encontrado'));
        }

        // Calcular novo custo médio se unitPrice fornecido
        if (unitPrice && unitPrice > 0) {
            const totalCurrentValue = inventory.currentStock * inventory.averageCost;
            const newValue = quantity * unitPrice;
            const newTotalStock = inventory.currentStock + quantity;

            inventory.averageCost = (totalCurrentValue + newValue) / newTotalStock;
        }

        inventory.currentStock += quantity;
        inventory.lastStockUpdate = new Date();
        inventory.updatedAt = new Date();

        console.log('MockInventoryService - Stock adicionado:', inventory);
        return of(inventory).pipe(delay(300));
    }

    addStockMovement(movement: Omit<StockMovement, 'id' | 'performedAt'>): Observable<StockMovement> {
        console.log('MockInventoryService - addStockMovement:', movement);

        const newMovement: StockMovement = {
            ...movement,
            id: this.generateId(),
            performedAt: new Date()
        };

        this.stockMovements.push(newMovement);
        console.log('MockInventoryService - Movimento criado:', newMovement);

        return of(newMovement).pipe(delay(200));
    }

    // Métodos auxiliares para movements
    getMovementsByInventoryId(inventoryId: string): Observable<StockMovement[]> {
        console.log('MockInventoryService - getMovementsByInventoryId:', inventoryId);
        const movements = this.stockMovements.filter(mov => mov.inventoryId === inventoryId);
        return of(movements).pipe(delay(200));
    }

    private generateId(): string {
        return 'mock_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
