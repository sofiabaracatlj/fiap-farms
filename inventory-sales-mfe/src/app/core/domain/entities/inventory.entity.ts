export interface Inventory {
    id: string;
    productId: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    averageCost: number;
    lastStockUpdate: Date;
    location?: string;
    expirationDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface StockMovement {
    id: string;
    inventoryId: string;
    movementType: MovementType;
    quantity: number;
    unitPrice?: number;
    reference?: string; // Sale ID, Production ID, etc.
    reason: string;
    performedBy: string;
    performedAt: Date;
    notes?: string;
}

export enum MovementType {
    IN = 'in',         // Entrada (produção, compra)
    OUT = 'out',       // Saída (venda, perda)
    ADJUSTMENT = 'adjustment' // Ajuste de estoque
}
