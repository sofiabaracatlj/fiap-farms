export interface Product {
    id: string;
    name: string;
    category: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    profitMargin: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductMetrics {
    productId: string;
    totalSales: number;
    totalProfit: number;
    profitMargin: number;
    salesVolume: number;
    period: {
        startDate: Date;
        endDate: Date;
    };
}
