import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, map, take, shareReplay } from 'rxjs/operators';
import { Sale, SaleStatus, PaymentMethod } from '../domain/entities/sale.entity';
import { SaleRepository } from '../domain/repositories/sale.repository';
import { ProductRepository } from '../domain/repositories/product.repository';
import { InventoryRepository } from '../domain/repositories/inventory.repository';
import { MovementType } from '../domain/entities/inventory.entity';

@Injectable()
export class CreateSaleUseCase {
    constructor(
        private saleRepository: SaleRepository,
        private productRepository: ProductRepository,
        private inventoryRepository: InventoryRepository
    ) { }

    execute(request: CreateSaleRequest): Observable<Sale> {
        console.log('CreateSaleUseCase - Request recebido:', request);

        // Primeiro, buscar o produto para obter preços e calcular lucro
        return this.productRepository.findById(request.productId).pipe(
            take(1), // Garantir execução única
            switchMap(product => {
                if (!product) {
                    throw new Error('Produto não encontrado');
                }

                // Calcular valores
                const unitPrice = request.unitPrice || product.unitPrice;
                const totalAmount = unitPrice * request.quantity;
                const profit = (unitPrice - product.costPrice) * request.quantity;

                // Criar objeto de venda
                const saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'> = {
                    productId: request.productId,
                    quantity: request.quantity,
                    unitPrice: unitPrice,
                    totalAmount: totalAmount,
                    profit: profit,
                    customerName: request.customerName,
                    customerEmail: request.customerEmail,
                    saleDate: request.saleDate || new Date(),
                    status: request.status || SaleStatus.COMPLETED,
                    paymentMethod: request.paymentMethod,
                    notes: request.notes
                };

                console.log('CreateSaleUseCase - Dados da venda:', saleData);

                // Criar a venda
                return this.saleRepository.create(saleData).pipe(
                    take(1), // Garantir execução única
                    switchMap(sale => {
                        // Atualizar estoque (diminuir quantidade) - executa apenas uma vez
                        return this.updateInventoryStock(request.productId, request.quantity, sale.id).pipe(
                            take(1), // Garantir execução única
                            map(() => sale)
                        );
                    })
                );
            })
        );
    }

    private updateInventoryStock(productId: string, quantity: number, saleId: string): Observable<any> {
        console.log('UpdateInventoryStock - INICIANDO atualização única para productId:', productId, 'saleId:', saleId);

        // Buscar inventory do produto com take(1) para garantir uma única execução
        return this.inventoryRepository.findByProductId(productId).pipe(
            take(1), // Garantir que execute apenas uma vez
            switchMap(inventory => {
                console.log('UpdateInventoryStock - Inventory encontrado:', inventory);

                if (!inventory) {
                    console.error('UpdateInventoryStock - Inventory não encontrado para productId:', productId);
                    throw new Error('Estoque do produto não encontrado');
                }

                console.log('UpdateInventoryStock - Estoque atual:', inventory.currentStock, 'Quantidade solicitada:', quantity);

                if (inventory.currentStock < quantity) {
                    console.error('UpdateInventoryStock - Estoque insuficiente:', {
                        disponivel: inventory.currentStock,
                        solicitado: quantity,
                        inventory: inventory
                    });
                    throw new Error(`Estoque insuficiente. Disponível: ${inventory.currentStock}, Solicitado: ${quantity}`);
                }

                console.log('UpdateInventoryStock - Atualizando estoque...');

                // Atualizar estoque com take(1) para garantir execução única
                return this.inventoryRepository.updateStock(inventory.id, quantity, MovementType.OUT).pipe(
                    take(1), // Garantir que execute apenas uma vez
                    switchMap(updatedInventory => {
                        console.log('UpdateInventoryStock - Estoque atualizado, criando movimento...');

                        // Registrar movimento de saída
                        const stockMovement = {
                            inventoryId: inventory.id,
                            movementType: MovementType.OUT,
                            quantity: quantity,
                            reference: saleId,
                            reason: 'Venda',
                            performedBy: 'Sistema',
                            notes: `Venda registrada - ID: ${saleId}`
                        };

                        return this.inventoryRepository.addStockMovement(stockMovement).pipe(
                            take(1), // Garantir que execute apenas uma vez
                            map(() => {
                                console.log('UpdateInventoryStock - CONCLUÍDO para saleId:', saleId);
                                return updatedInventory;
                            })
                        );
                    })
                );
            })
        );
    }
}

export interface CreateSaleRequest {
    productId: string;
    quantity: number;
    unitPrice?: number; // Se não fornecido, usa preço do produto
    customerName?: string;
    customerEmail?: string;
    saleDate?: Date;
    status?: SaleStatus;
    paymentMethod: PaymentMethod;
    notes?: string;
}
