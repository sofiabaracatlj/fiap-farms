export interface Production {
    id: string;
    productId: string;
    batchNumber: string;
    plannedQuantity: number;
    actualQuantity?: number;
    startDate: Date;
    expectedEndDate: Date;
    actualEndDate?: Date;
    status: ProductionStatus;
    location?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProductionStatus {
    PLANNING = 'planning',
    WAITING = 'waiting',
    IN_PROGRESS = 'in_progress',
    HARVESTED = 'harvested',
    QUALITY_CHECK = 'quality_check',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface ProductionMetrics {
    totalPlanned: number;
    totalInProgress: number;
    totalHarvested: number;
    totalCompleted: number;
    efficiency: number; // percentage
    period: {
        startDate: Date;
        endDate: Date;
    };
}
