export interface Sale {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    profit: number;
    customerName?: string;
    customerEmail?: string;
    saleDate: Date;
    status: SaleStatus;
    paymentMethod: PaymentMethod;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum SaleStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum PaymentMethod {
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PIX = 'pix',
    BANK_TRANSFER = 'bank_transfer'
}
