import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SaleStatus, PaymentMethod } from '../domain/entities/sale.entity';
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class FirebaseSeederService {
    constructor(private firestore: AngularFirestore) { }

    async seedDatabase() {
        console.log('🌱 Iniciando população do banco de dados...');

        try {
            // Verificar se já existem dados
            const salesCount = await this.firestore.collection('sales').get().toPromise();
            const productsCount = await this.firestore.collection('products').get().toPromise();
            const inventoriesCount = await this.firestore.collection('inventories').get().toPromise();

            if (salesCount?.size === 0 && productsCount?.size === 0 && inventoriesCount?.size === 0) {
                console.log('📦 Criando dados de exemplo...');
                await this.createSampleData();
                console.log('✅ Dados de exemplo criados com sucesso!');
            } else {
                console.log('ℹ️ Dados já existem no banco.');
                console.log(`- Products: ${productsCount?.size || 0}`);
                console.log(`- Inventories: ${inventoriesCount?.size || 0}`);
                console.log(`- Sales: ${salesCount?.size || 0}`);
            }
        } catch (error) {
            console.error('❌ Erro ao popular banco:', error);
        }
    }

    private async createSampleData() {
        const now = firebase.firestore.Timestamp.now();

        // Criar produtos
        const products = [
            {
                name: 'Tomate Orgânico',
                category: 'Hortaliças',
                description: 'Tomate orgânico cultivado sem agrotóxicos',
                unitPrice: 8.50,
                costPrice: 4.25,
                profitMargin: 100,
                imageUrl: '',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Alface Americana',
                category: 'Folhosos',
                description: 'Alface americana fresca',
                unitPrice: 3.20,
                costPrice: 1.60,
                profitMargin: 100,
                imageUrl: '',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Cenoura Baby',
                category: 'Raízes',
                description: 'Cenoura baby doce e crocante',
                unitPrice: 6.90,
                costPrice: 3.45,
                profitMargin: 100,
                imageUrl: '',
                createdAt: now,
                updatedAt: now
            }
        ];

        const productIds: string[] = [];
        for (const product of products) {
            const docRef = await this.firestore.collection('products').add(product);
            productIds.push(docRef.id);
            console.log(`Produto criado: ${product.name} (${docRef.id})`);
        }

        // Criar inventários
        for (let i = 0; i < productIds.length; i++) {
            const inventory = {
                productId: productIds[i],
                currentStock: Math.floor(Math.random() * 100) + 50,
                minimumStock: 10,
                maximumStock: 200,
                averageCost: products[i].costPrice,
                lastStockUpdate: now,
                location: 'Estoque Principal',
                createdAt: now,
                updatedAt: now
            };

            const docRef = await this.firestore.collection('inventories').add(inventory);
            console.log(`Inventário criado para produto ${productIds[i]} (${docRef.id})`);
        }

        // Criar vendas dos últimos 3 meses
        const sales = [];
        const currentDate = new Date();

        for (let month = 0; month < 3; month++) {
            const monthDate = new Date(currentDate);
            monthDate.setMonth(monthDate.getMonth() - month);

            // 10-20 vendas por mês
            const salesCount = Math.floor(Math.random() * 11) + 10;

            for (let i = 0; i < salesCount; i++) {
                const productIndex = Math.floor(Math.random() * productIds.length);
                const product = products[productIndex];
                const quantity = Math.floor(Math.random() * 10) + 1;
                const totalAmount = product.unitPrice * quantity;
                const profit = (product.unitPrice - product.costPrice) * quantity;

                // Data aleatória no mês
                const saleDate = new Date(monthDate);
                saleDate.setDate(Math.floor(Math.random() * 28) + 1);
                saleDate.setHours(Math.floor(Math.random() * 12) + 8); // 8h às 20h

                const sale = {
                    productId: productIds[productIndex],
                    quantity,
                    unitPrice: product.unitPrice,
                    totalAmount,
                    profit,
                    customerName: `Cliente ${Math.floor(Math.random() * 100) + 1}`,
                    customerEmail: `cliente${Math.floor(Math.random() * 100) + 1}@email.com`,
                    saleDate: firebase.firestore.Timestamp.fromDate(saleDate),
                    status: SaleStatus.COMPLETED,
                    paymentMethod: Math.random() > 0.5 ? PaymentMethod.PIX : PaymentMethod.CASH,
                    notes: '',
                    createdAt: firebase.firestore.Timestamp.fromDate(saleDate),
                    updatedAt: firebase.firestore.Timestamp.fromDate(saleDate)
                };

                sales.push(sale);
            }
        }

        // Inserir vendas
        for (const sale of sales) {
            const docRef = await this.firestore.collection('sales').add(sale);
            console.log(`Venda criada: ${sale.quantity}x produto ${sale.productId} em ${sale.saleDate.toDate().toLocaleDateString()} (${docRef.id})`);
        }

        console.log(`📊 Criados: ${products.length} produtos, ${productIds.length} inventários, ${sales.length} vendas`);
    }
}
