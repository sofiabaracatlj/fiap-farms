import { Injectable, NgZone } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Inventory, StockMovement, MovementType } from '../domain/entities/inventory.entity';
import { InventoryRepository } from '../domain/repositories/inventory.repository';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

// Interface para dados do Firestore - Inventory
interface FirestoreInventory {
    productId: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    averageCost: number;
    lastStockUpdate: firebase.firestore.Timestamp;
    location?: string;
    expirationDate?: firebase.firestore.Timestamp;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
}

// Interface para dados do Firestore - StockMovement
interface FirestoreStockMovement {
    inventoryId: string;
    movementType: MovementType;
    quantity: number;
    unitPrice?: number;
    reference?: string;
    reason: string;
    performedBy: string;
    performedAt: firebase.firestore.Timestamp;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseInventoryService implements InventoryRepository {
    private inventoriesCollection: AngularFirestoreCollection<FirestoreInventory>;
    private stockMovementsCollection: AngularFirestoreCollection<FirestoreStockMovement>;

    constructor(
        private ngZone: NgZone,
        private firestore: AngularFirestore
    ) {
        console.log('🔥 FirebaseInventoryService - Inicializando conexão...');

        try {
            this.inventoriesCollection = this.firestore.collection<FirestoreInventory>('inventories');
            this.stockMovementsCollection = this.firestore.collection<FirestoreStockMovement>('stock_movements');
            console.log('✅ Collections "inventories" e "stock_movements" criadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar collections de inventário:', error);
        }
    }

    findAll(): Observable<Inventory[]> {
        console.log('🔍 Buscando todos os inventários no Firebase...');

        return this.inventoriesCollection.valueChanges({ idField: 'id' }).pipe(
            map(inventories => {
                console.log(`📦 ${inventories.length} inventários encontrados no Firebase`);
                if (inventories.length > 0) {
                    console.log('📋 Primeiro inventário:', inventories[0]);
                }
                return inventories.map(this.convertFirestoreToInventory);
            }),
            catchError(error => {
                console.error('❌ Erro ao carregar inventários do Firebase:', error);
                throw error;
            })
        );
    }

    findById(id: string): Observable<Inventory | null> {
        return this.firestore.doc<FirestoreInventory>(`inventories/${id}`).valueChanges({ idField: 'id' }).pipe(
            map(inventory => inventory ? this.convertFirestoreToInventory(inventory) : null)
        );
    }

    findByProductId(productId: string): Observable<Inventory | null> {
        console.log('FirebaseInventoryService - Buscando inventory para productId:', productId);

        return this.firestore.collection<FirestoreInventory>('inventories', ref =>
            ref.where('productId', '==', productId).limit(1)
        ).valueChanges({ idField: 'id' }).pipe(
            map(inventories => {
                console.log('FirebaseInventoryService - Resultados encontrados:', inventories);

                if (inventories.length > 0) {
                    const converted = this.convertFirestoreToInventory(inventories[0]);
                    console.log('FirebaseInventoryService - Inventory convertido:', converted);
                    return converted;
                } else {
                    console.log('FirebaseInventoryService - Nenhum inventory encontrado para productId:', productId);
                    return null;
                }
            })
        );
    }

    findByProductIds(productIds: string[]): Observable<Inventory[]> {
        console.log('🔍 Buscando inventário por IDs de produtos específicos...', productIds.length, 'IDs');

        if (productIds.length === 0) {
            console.log('📦 Nenhum ID de produto fornecido, retornando array vazio');
            return from([[]]);
        }

        // Firebase tem limite de 10 IDs por consulta "in"
        const chunks = this.chunkArray(productIds, 10);

        return from(Promise.all(
            chunks.map(chunk =>
                this.inventoriesCollection.ref
                    .where('productId', 'in', chunk)
                    .get()
                    .then(snapshot => {
                        const inventories: Inventory[] = [];
                        snapshot.forEach(doc => {
                            const data = doc.data() as FirestoreInventory;
                            inventories.push(this.convertFirestoreToInventory({ id: doc.id, ...data }));
                        });
                        return inventories;
                    })
            )
        )).pipe(
            map(results => {
                const allInventories = results.flat();
                console.log(`📦 ${allInventories.length} itens de inventário encontrados para ${productIds.length} produtos`);
                return allInventories;
            }),
            catchError(error => {
                console.error('❌ Erro ao carregar inventário por IDs de produtos:', error);
                throw error;
            })
        );
    }

    findLowStockItems(): Observable<Inventory[]> {
        return this.inventoriesCollection.valueChanges({ idField: 'id' }).pipe(
            map(inventories => {
                const converted = inventories.map(this.convertFirestoreToInventory);
                return converted.filter(inv => inv.currentStock <= inv.minimumStock);
            })
        );
    }

    findLowStockByProductIds(productIds: string[]): Observable<Inventory[]> {
        console.log('🔍 Buscando itens com estoque baixo para produtos específicos...', productIds.length, 'IDs');

        if (productIds.length === 0) {
            return from([[]]);
        }

        const chunks = this.chunkArray(productIds, 10);

        return from(Promise.all(
            chunks.map(chunk =>
                this.inventoriesCollection.ref
                    .where('productId', 'in', chunk)
                    .get()
                    .then(snapshot => {
                        const lowStockItems: Inventory[] = [];
                        snapshot.forEach(doc => {
                            const data = doc.data() as FirestoreInventory;
                            const inventory = this.convertFirestoreToInventory({ id: doc.id, ...data });
                            // Filtrar apenas itens com estoque baixo
                            if (inventory.currentStock < inventory.minimumStock) {
                                lowStockItems.push(inventory);
                            }
                        });
                        return lowStockItems;
                    })
            )
        )).pipe(
            map(results => {
                const allLowStockItems = results.flat();
                console.log(`⚠️ ${allLowStockItems.length} itens com estoque baixo encontrados`);
                return allLowStockItems;
            }),
            catchError(error => {
                console.error('❌ Erro ao carregar itens com estoque baixo:', error);
                throw error;
            })
        );
    }

    create(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Observable<Inventory> {
        return from(this.createInventory(inventory));
    }

    private async createInventory(inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Inventory> {
        const now = firebase.firestore.Timestamp.now();

        const firestoreInventory: FirestoreInventory = {
            productId: inventory.productId,
            currentStock: inventory.currentStock,
            minimumStock: inventory.minimumStock,
            maximumStock: inventory.maximumStock,
            averageCost: inventory.averageCost,
            lastStockUpdate: inventory.lastStockUpdate ? firebase.firestore.Timestamp.fromDate(inventory.lastStockUpdate) : now,
            createdAt: now,
            updatedAt: now
        };

        // Adicionar campos opcionais apenas se não forem undefined
        if (inventory.location !== undefined && inventory.location !== null) {
            firestoreInventory.location = inventory.location;
        }
        if (inventory.expirationDate !== undefined && inventory.expirationDate !== null) {
            firestoreInventory.expirationDate = firebase.firestore.Timestamp.fromDate(inventory.expirationDate);
        }

        console.log('Dados que serão salvos no Firebase (Inventory):', firestoreInventory);

        try {
            const docRef = await this.inventoriesCollection.add(firestoreInventory);
            console.log('Inventory salvo no Firebase com ID:', docRef.id);

            return {
                id: docRef.id,
                productId: inventory.productId,
                currentStock: inventory.currentStock,
                minimumStock: inventory.minimumStock,
                maximumStock: inventory.maximumStock,
                averageCost: inventory.averageCost,
                lastStockUpdate: inventory.lastStockUpdate || now.toDate(),
                location: inventory.location,
                expirationDate: inventory.expirationDate,
                createdAt: now.toDate(),
                updatedAt: now.toDate()
            } as Inventory;
        } catch (error) {
            console.error('Erro ao salvar inventory no Firebase:', error);
            throw error;
        }
    }

    update(id: string, inventory: Partial<Inventory>): Observable<Inventory> {
        return from(this.updateInventory(id, inventory));
    }

    private async updateInventory(id: string, inventory: Partial<Inventory>): Promise<Inventory> {
        const now = firebase.firestore.Timestamp.now();

        const updateData: any = {
            updatedAt: now
        };

        if (inventory.currentStock !== undefined) updateData.currentStock = inventory.currentStock;
        if (inventory.minimumStock !== undefined) updateData.minimumStock = inventory.minimumStock;
        if (inventory.maximumStock !== undefined) updateData.maximumStock = inventory.maximumStock;
        if (inventory.averageCost !== undefined) updateData.averageCost = inventory.averageCost;
        if (inventory.lastStockUpdate !== undefined) updateData.lastStockUpdate = firebase.firestore.Timestamp.fromDate(inventory.lastStockUpdate);
        if (inventory.location !== undefined) updateData.location = inventory.location;
        if (inventory.expirationDate !== undefined) {
            updateData.expirationDate = inventory.expirationDate ? firebase.firestore.Timestamp.fromDate(inventory.expirationDate) : null;
        }

        console.log('Dados que serão atualizados no Firebase (Inventory):', updateData);

        try {
            await this.firestore.doc(`inventories/${id}`).update(updateData);

            const updatedDoc = await this.firestore.doc<FirestoreInventory>(`inventories/${id}`).get().toPromise();

            if (updatedDoc && updatedDoc.exists) {
                const data = updatedDoc.data();
                if (data) {
                    console.log('Inventory atualizado no Firebase:', data);
                    return this.convertFirestoreToInventory({ id, ...data });
                }
            }

            throw new Error('Inventory não encontrado após atualização');
        } catch (error) {
            console.error('Erro ao atualizar inventory no Firebase:', error);
            throw error;
        }
    }

    delete(id: string): Observable<boolean> {
        return from(this.deleteInventory(id));
    }

    private async deleteInventory(id: string): Promise<boolean> {
        try {
            await this.firestore.doc(`inventories/${id}`).delete();
            console.log('Inventory removido do Firebase:', id);
            return true;
        } catch (error) {
            console.error('Erro ao remover inventory do Firebase:', error);
            throw error;
        }
    }

    updateStock(inventoryId: string, quantity: number, movementType: MovementType): Observable<Inventory> {
        return from(this.updateStockQuantity(inventoryId, quantity, movementType));
    }

    private async updateStockQuantity(inventoryId: string, quantity: number, movementType: MovementType): Promise<Inventory> {
        const inventoryRef = this.firestore.doc(`inventories/${inventoryId}`);
        const inventoryDoc = await inventoryRef.get().toPromise();

        if (!inventoryDoc || !inventoryDoc.exists) {
            throw new Error('Inventory não encontrado');
        }

        const currentData = inventoryDoc.data() as FirestoreInventory;
        let newStock = currentData.currentStock;

        if (movementType === MovementType.IN) {
            newStock += quantity;
        } else if (movementType === MovementType.OUT) {
            newStock -= quantity;
            if (newStock < 0) newStock = 0;
        } else { // ADJUSTMENT
            newStock = quantity;
        }

        const now = firebase.firestore.Timestamp.now();
        await inventoryRef.update({
            currentStock: newStock,
            lastStockUpdate: now,
            updatedAt: now
        });

        const updatedDoc = await inventoryRef.get().toPromise();
        const updatedData = updatedDoc?.data() as FirestoreInventory;

        return this.convertFirestoreToInventory({ id: inventoryId, ...updatedData });
    }

    addStock(inventoryId: string, quantity: number, unitPrice?: number): Observable<Inventory> {
        return from(this.addStockQuantity(inventoryId, quantity, unitPrice));
    }

    private async addStockQuantity(inventoryId: string, quantity: number, unitPrice?: number): Promise<Inventory> {
        const inventoryRef = this.firestore.doc(`inventories/${inventoryId}`);
        const inventoryDoc = await inventoryRef.get().toPromise();

        if (!inventoryDoc || !inventoryDoc.exists) {
            throw new Error('Inventory não encontrado');
        }

        const currentData = inventoryDoc.data() as FirestoreInventory;
        let newAverageCost = currentData.averageCost;

        // Calcular novo custo médio se unitPrice fornecido
        if (unitPrice && unitPrice > 0) {
            const totalCurrentValue = currentData.currentStock * currentData.averageCost;
            const newValue = quantity * unitPrice;
            const newTotalStock = currentData.currentStock + quantity;

            newAverageCost = (totalCurrentValue + newValue) / newTotalStock;
        }

        const now = firebase.firestore.Timestamp.now();
        await inventoryRef.update({
            currentStock: currentData.currentStock + quantity,
            averageCost: newAverageCost,
            lastStockUpdate: now,
            updatedAt: now
        });

        const updatedDoc = await inventoryRef.get().toPromise();
        const updatedData = updatedDoc?.data() as FirestoreInventory;

        console.log('Stock adicionado no Firebase:', updatedData);
        return this.convertFirestoreToInventory({ id: inventoryId, ...updatedData });
    }

    addStockMovement(movement: Omit<StockMovement, 'id' | 'performedAt'>): Observable<StockMovement> {
        return from(this.createStockMovement(movement));
    }

    private async createStockMovement(movement: Omit<StockMovement, 'id' | 'performedAt'>): Promise<StockMovement> {
        const now = firebase.firestore.Timestamp.now();

        const firestoreMovement: FirestoreStockMovement = {
            inventoryId: movement.inventoryId,
            movementType: movement.movementType,
            quantity: movement.quantity,
            reason: movement.reason,
            performedBy: movement.performedBy,
            performedAt: now
        };

        // Adicionar campos opcionais apenas se não forem undefined
        if (movement.unitPrice !== undefined && movement.unitPrice !== null) {
            firestoreMovement.unitPrice = movement.unitPrice;
        }
        if (movement.reference !== undefined && movement.reference !== null) {
            firestoreMovement.reference = movement.reference;
        }
        if (movement.notes !== undefined && movement.notes !== null) {
            firestoreMovement.notes = movement.notes;
        }

        console.log('Dados que serão salvos no Firebase (StockMovement):', firestoreMovement);

        try {
            const docRef = await this.stockMovementsCollection.add(firestoreMovement);
            console.log('StockMovement salvo no Firebase com ID:', movement.inventoryId);

            return {
                id: docRef.id,
                inventoryId: movement.inventoryId,
                movementType: movement.movementType,
                quantity: movement.quantity,
                unitPrice: movement.unitPrice,
                reference: movement.reference,
                reason: movement.reason,
                performedBy: movement.performedBy,
                performedAt: now.toDate(),
                notes: movement.notes
            } as StockMovement;
        } catch (error) {
            console.error('Erro ao salvar stock movement no Firebase:', error);
            throw error;
        }
    }

    // Método auxiliar para converter dados do Firestore para Inventory
    private convertFirestoreToInventory = (data: any): Inventory => {
        return {
            id: data.id,
            productId: data.productId,
            currentStock: data.currentStock,
            minimumStock: data.minimumStock,
            maximumStock: data.maximumStock,
            averageCost: data.averageCost,
            lastStockUpdate: data.lastStockUpdate?.toDate() || new Date(),
            location: data.location,
            expirationDate: data.expirationDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
