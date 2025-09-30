import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { Product } from '../domain/entities/product.entity';
import { Inventory } from '../domain/entities/inventory.entity';
import { Sale, SaleStatus, PaymentMethod } from '../domain/entities/sale.entity';

@Injectable({
    providedIn: 'root'
})
export class MockDataService {

    // Simula collections do Firebase com BehaviorSubject para reatividade
    private productsSubject = new BehaviorSubject<Product[]>([]);
    private inventoriesSubject = new BehaviorSubject<Inventory[]>([]);
    private salesSubject = new BehaviorSubject<Sale[]>([]);

    constructor() {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        console.log('MockDataService - Inicializando dados simulados');

        // Produtos simulados
        const mockProducts: Product[] = [
            {
                id: 'prod-001',
                name: 'Tomates Orgânicos',
                description: 'Tomates orgânicos frescos, cultivados sem agrotóxicos',
                category: 'Vegetais',
                unitPrice: 8.50,
                costPrice: 4.20,
                profitMargin: 50.59,
                imageUrl: 'https://example.com/tomates.jpg',
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date('2025-09-20')
            },
            {
                id: 'prod-002',
                name: 'Alface Hidropônica',
                description: 'Alface crespa hidropônica, folhas verdes e crocantes',
                category: 'Vegetais',
                unitPrice: 5.00,
                costPrice: 2.50,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/alface.jpg',
                createdAt: new Date('2025-01-20'),
                updatedAt: new Date('2025-09-18')
            },
            {
                id: 'prod-003',
                name: 'Cenouras Baby',
                description: 'Cenouras baby doces e tenras',
                category: 'Vegetais',
                unitPrice: 12.00,
                costPrice: 6.00,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/cenouras.jpg',
                createdAt: new Date('2025-02-10'),
                updatedAt: new Date('2025-09-15')
            },
            {
                id: 'prod-004',
                name: 'Rúcula Premium',
                description: 'Rúcula gourmet com sabor acentuado',
                category: 'Vegetais',
                unitPrice: 15.00,
                costPrice: 7.50,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/rucula.jpg',
                createdAt: new Date('2025-02-15'),
                updatedAt: new Date('2025-09-10')
            },
            {
                id: 'prod-005',
                name: 'Espinafre Baby',
                description: 'Espinafre baby tenro e nutritivo',
                category: 'Vegetais',
                unitPrice: 18.00,
                costPrice: 9.00,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/espinafre.jpg',
                createdAt: new Date('2025-03-01'),
                updatedAt: new Date('2025-09-05')
            }
        ];

        // Inventários simulados
        const mockInventories: Inventory[] = [
            {
                id: 'inv-001',
                productId: 'prod-001',
                currentStock: 25,
                minimumStock: 10,
                maximumStock: 100,
                averageCost: 4.20,
                location: 'Estufa A1',
                lastStockUpdate: new Date('2025-09-20'),
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date('2025-09-20')
            },
            {
                id: 'inv-002',
                productId: 'prod-002',
                currentStock: 8,
                minimumStock: 15,
                maximumStock: 50,
                averageCost: 2.50,
                location: 'Estufa B2',
                lastStockUpdate: new Date('2025-09-18'),
                createdAt: new Date('2025-01-20'),
                updatedAt: new Date('2025-09-18')
            },
            {
                id: 'inv-003',
                productId: 'prod-003',
                currentStock: 30,
                minimumStock: 12,
                maximumStock: 80,
                averageCost: 6.00,
                location: 'Campo C3',
                lastStockUpdate: new Date('2025-09-15'),
                createdAt: new Date('2025-02-10'),
                updatedAt: new Date('2025-09-15')
            },
            {
                id: 'inv-004',
                productId: 'prod-004',
                currentStock: 5,
                minimumStock: 8,
                maximumStock: 40,
                averageCost: 7.50,
                location: 'Estufa A2',
                lastStockUpdate: new Date('2025-09-10'),
                createdAt: new Date('2025-02-15'),
                updatedAt: new Date('2025-09-10')
            },
            {
                id: 'inv-005',
                productId: 'prod-005',
                currentStock: 20,
                minimumStock: 10,
                maximumStock: 60,
                averageCost: 9.00,
                location: 'Estufa B1',
                lastStockUpdate: new Date('2025-09-05'),
                createdAt: new Date('2025-03-01'),
                updatedAt: new Date('2025-09-05')
            }
        ];

        // Vendas simuladas
        const mockSales: Sale[] = [
            {
                id: 'sale-001',
                productId: 'prod-001',
                quantity: 5,
                unitPrice: 8.50,
                totalAmount: 42.50,
                profit: 21.50,
                customerName: 'João Silva',
                customerEmail: 'joao@email.com',
                saleDate: new Date('2025-09-20T10:30:00'),
                status: SaleStatus.COMPLETED,
                paymentMethod: PaymentMethod.PIX,
                notes: 'Cliente frequente',
                createdAt: new Date('2025-09-20T10:30:00'),
                updatedAt: new Date('2025-09-20T10:30:00')
            },
            {
                id: 'sale-002',
                productId: 'prod-002',
                quantity: 10,
                unitPrice: 5.00,
                totalAmount: 50.00,
                profit: 25.00,
                customerName: 'Maria Santos',
                customerEmail: 'maria@email.com',
                saleDate: new Date('2025-09-19T14:15:00'),
                status: SaleStatus.COMPLETED,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                createdAt: new Date('2025-09-19T14:15:00'),
                updatedAt: new Date('2025-09-19T14:15:00')
            },
            {
                id: 'sale-003',
                productId: 'prod-003',
                quantity: 3,
                unitPrice: 12.00,
                totalAmount: 36.00,
                profit: 18.00,
                customerName: 'Pedro Costa',
                customerEmail: 'pedro@email.com',
                saleDate: new Date('2025-09-18T09:45:00'),
                status: SaleStatus.COMPLETED,
                paymentMethod: PaymentMethod.CASH,
                createdAt: new Date('2025-09-18T09:45:00'),
                updatedAt: new Date('2025-09-18T09:45:00')
            },
            {
                id: 'sale-004',
                productId: 'prod-004',
                quantity: 2,
                unitPrice: 15.00,
                totalAmount: 30.00,
                profit: 15.00,
                customerName: 'Ana Lima',
                customerEmail: 'ana@email.com',
                saleDate: new Date('2025-09-17T16:20:00'),
                status: SaleStatus.PENDING,
                paymentMethod: PaymentMethod.PIX,
                notes: 'Aguardando confirmação',
                createdAt: new Date('2025-09-17T16:20:00'),
                updatedAt: new Date('2025-09-17T16:20:00')
            },
            {
                id: 'sale-005',
                productId: 'prod-005',
                quantity: 4,
                unitPrice: 18.00,
                totalAmount: 72.00,
                profit: 36.00,
                customerName: 'Carlos Oliveira',
                customerEmail: 'carlos@email.com',
                saleDate: new Date('2025-09-16T11:00:00'),
                status: SaleStatus.COMPLETED,
                paymentMethod: PaymentMethod.DEBIT_CARD,
                createdAt: new Date('2025-09-16T11:00:00'),
                updatedAt: new Date('2025-09-16T11:00:00')
            }
        ];    // Emitir dados iniciais
        this.productsSubject.next(mockProducts);
        this.inventoriesSubject.next(mockInventories);
        this.salesSubject.next(mockSales);

        console.log('MockDataService - Dados simulados carregados:', {
            products: mockProducts.length,
            inventories: mockInventories.length,
            sales: mockSales.length
        });
    }

    // Métodos para Products
    getProducts(): Observable<Product[]> {
        console.log('MockDataService - Carregando produtos simulados');
        return this.productsSubject.asObservable().pipe(
            delay(100), // Reduzido de 300ms para 100ms
            tap(products => console.log('MockDataService - Retornando produtos:', products))
        );
    }

    getProductById(id: string): Observable<Product | null> {
        return this.productsSubject.asObservable().pipe(
            map(products => products.find(p => p.id === id) || null),
            delay(200)
        );
    }

    addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
        const newProduct: Product = {
            ...product,
            id: `prod-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const currentProducts = this.productsSubject.value;
        this.productsSubject.next([...currentProducts, newProduct]);

        console.log('MockDataService - Produto adicionado:', newProduct);
        return of(newProduct).pipe(delay(400));
    }

    // Métodos para Inventories
    getInventories(): Observable<Inventory[]> {
        return this.inventoriesSubject.asObservable().pipe(
            delay(100), // Reduzido de 350ms para 100ms
            tap(inventories => console.log('MockDataService - Retornando inventários:', inventories.length))
        );
    }

    getInventoryByProductId(productId: string): Observable<Inventory | null> {
        return this.inventoriesSubject.asObservable().pipe(
            map(inventories => inventories.find(inv => inv.productId === productId) || null),
            delay(200)
        );
    }

    getLowStockItems(): Observable<Inventory[]> {
        return this.inventoriesSubject.asObservable().pipe(
            map(inventories => inventories.filter(inv => inv.currentStock <= inv.minimumStock)),
            delay(300),
            tap(lowStock => console.log('MockDataService - Itens com estoque baixo:', lowStock.length))
        );
    }

    updateInventoryStock(inventoryId: string, quantity: number, isOutbound: boolean = false): Observable<Inventory> {
        const currentInventories = this.inventoriesSubject.value;
        const inventoryIndex = currentInventories.findIndex(inv => inv.id === inventoryId);

        if (inventoryIndex === -1) {
            throw new Error('Inventory não encontrado');
        }

        const inventory = { ...currentInventories[inventoryIndex] };

        if (isOutbound) {
            inventory.currentStock -= quantity;
            if (inventory.currentStock < 0) inventory.currentStock = 0;
        } else {
            inventory.currentStock += quantity;
        }

        inventory.lastStockUpdate = new Date();
        inventory.updatedAt = new Date();

        currentInventories[inventoryIndex] = inventory;
        this.inventoriesSubject.next([...currentInventories]);

        console.log(`MockDataService - Estoque atualizado: ${inventory.currentStock} (${isOutbound ? 'saída' : 'entrada'} de ${quantity})`);
        return of(inventory).pipe(delay(400));
    }

    // Métodos para Sales
    getSales(): Observable<Sale[]> {
        return this.salesSubject.asObservable().pipe(
            delay(100), // Reduzido de 300ms para 100ms
            tap(sales => console.log('MockDataService - Retornando vendas:', sales.length))
        );
    }

    addSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Observable<Sale> {
        const newSale: Sale = {
            ...sale,
            id: `sale-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const currentSales = this.salesSubject.value;
        this.salesSubject.next([...currentSales, newSale]);

        // Simular atualização automática do estoque
        this.getInventoryByProductId(sale.productId).subscribe(inventory => {
            if (inventory) {
                this.updateInventoryStock(inventory.id, sale.quantity, true);
            }
        });

        console.log('MockDataService - Venda adicionada:', newSale);
        return of(newSale).pipe(delay(500));
    }
}
