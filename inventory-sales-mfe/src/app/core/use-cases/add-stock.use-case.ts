import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Inventory, StockMovement, MovementType } from '../domain/entities/inventory.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';

@Injectable()
export class AddStockUseCase {
    constructor(private inventoryRepository: InventoryRepository) { }

    execute(request: AddStockRequest): Observable<{ inventory: Inventory; movement: StockMovement }> {
        console.log('AddStockUseCase - Request recebido:', request);

        // Criar movimento de entrada
        const stockMovement: Omit<StockMovement, 'id' | 'performedAt'> = {
            inventoryId: request.inventoryId || '',
            movementType: MovementType.IN,
            quantity: request.quantity,
            unitPrice: request.unitPrice,
            reason: request.reason,
            performedBy: request.performedBy || 'Sistema',
            notes: request.notes
        };

        // Se é um novo produto (não tem inventoryId), criar inventory primeiro
        if (!request.inventoryId) {
            const newInventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'> = {
                productId: request.productId,
                currentStock: request.quantity,
                minimumStock: request.minimumStock || 10,
                maximumStock: request.maximumStock || 1000,
                averageCost: request.unitPrice || 0,
                lastStockUpdate: new Date(),
                location: request.location,
                expirationDate: request.expirationDate
            };

            console.log('Criando novo inventory:', newInventory);

            return this.inventoryRepository.create(newInventory).pipe(
                switchMap(inventory => {
                    stockMovement.inventoryId = inventory.id;
                    console.log('Criando movimento de estoque:', stockMovement);

                    return this.inventoryRepository.addStockMovement(stockMovement).pipe(
                        map(movement => ({
                            inventory,
                            movement
                        }))
                    );
                })
            );
        } else {
            // Produto já existe, apenas adicionar stock
            console.log('Adicionando stock ao inventory existente:', request.inventoryId);

            return this.inventoryRepository.addStock(
                request.inventoryId,
                request.quantity,
                request.unitPrice
            ).pipe(
                switchMap(inventory =>
                    this.inventoryRepository.addStockMovement(stockMovement).pipe(
                        map(movement => ({
                            inventory,
                            movement
                        }))
                    )
                )
            );
        }
    }
}

export interface AddStockRequest {
    productId: string;
    inventoryId?: string; // Se não fornecido, cria novo inventory
    quantity: number;
    unitPrice?: number;
    reason: string;
    location?: string;
    expirationDate?: Date;
    minimumStock?: number;
    maximumStock?: number;
    performedBy?: string;
    notes?: string;
}
