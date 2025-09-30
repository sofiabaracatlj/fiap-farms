import { Injectable, NgZone } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Sale, SaleStatus, PaymentMethod } from '../domain/entities/sale.entity';
import { SaleRepository } from '../domain/repositories/sale.repository';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

// Interface para dados do Firestore - Sale
interface FirestoreSale {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    profit: number;
    customerName?: string;
    customerEmail?: string;
    saleDate: firebase.firestore.Timestamp;
    status: SaleStatus;
    paymentMethod: PaymentMethod;
    notes?: string;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseSaleService implements SaleRepository {
    private salesCollection: AngularFirestoreCollection<FirestoreSale>;

    constructor(
        private ngZone: NgZone,
        private firestore: AngularFirestore
    ) {
        console.log('FirebaseSaleService - Constructor chamado');
        console.log('FirebaseSaleService - AngularFirestore instance:', this.firestore);

        try {
            this.salesCollection = this.firestore.collection<FirestoreSale>('sales');
            console.log('FirebaseSaleService - Sales collection criada');
        } catch (error) {
            console.error('FirebaseSaleService - Erro ao criar collection:', error);
        }
    }

    findAll(): Observable<Sale[]> {
        console.log('FirebaseSaleService - Carregando todas as vendas do Firebase');

        return this.salesCollection.valueChanges({ idField: 'id' }).pipe(
            map(sales => {
                console.log('FirebaseSaleService - Vendas recebidas do Firebase:', sales);
                return sales.map(this.convertFirestoreToSale);
            }),
            catchError(error => {
                console.error('FirebaseSaleService - Erro ao carregar vendas:', error);
                throw error;
            })
        );
    }

    findById(id: string): Observable<Sale | null> {
        return this.firestore.doc<FirestoreSale>(`sales/${id}`).valueChanges({ idField: 'id' }).pipe(
            map(sale => sale ? this.convertFirestoreToSale(sale) : null)
        );
    }

    findByProductId(productId: string): Observable<Sale[]> {
        return this.firestore.collection<FirestoreSale>('sales', ref =>
            ref.where('productId', '==', productId)
        ).valueChanges({ idField: 'id' }).pipe(
            map(sales => sales.map(this.convertFirestoreToSale))
        );
    }

    findByDateRange(startDate: Date, endDate: Date): Observable<Sale[]> {
        const startTimestamp = firebase.firestore.Timestamp.fromDate(startDate);
        const endTimestamp = firebase.firestore.Timestamp.fromDate(endDate);

        return this.firestore.collection<FirestoreSale>('sales', ref =>
            ref.where('saleDate', '>=', startTimestamp)
                .where('saleDate', '<=', endTimestamp)
                .orderBy('saleDate', 'desc')
        ).valueChanges({ idField: 'id' }).pipe(
            map(sales => sales.map(this.convertFirestoreToSale))
        );
    }

    findByStatus(status: SaleStatus): Observable<Sale[]> {
        return this.firestore.collection<FirestoreSale>('sales', ref =>
            ref.where('status', '==', status)
        ).valueChanges({ idField: 'id' }).pipe(
            map(sales => sales.map(this.convertFirestoreToSale))
        );
    }

    create(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Observable<Sale> {
        return from(this.createSale(sale));
    }

    private async createSale(sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> {
        const now = firebase.firestore.Timestamp.now();

        const firestoreSale: FirestoreSale = {
            productId: sale.productId,
            quantity: sale.quantity,
            unitPrice: sale.unitPrice,
            totalAmount: sale.totalAmount,
            profit: sale.profit,
            saleDate: firebase.firestore.Timestamp.fromDate(sale.saleDate),
            status: sale.status,
            paymentMethod: sale.paymentMethod,
            createdAt: now,
            updatedAt: now
        };

        // Adicionar campos opcionais apenas se não forem undefined
        if (sale.customerName !== undefined && sale.customerName !== null) {
            firestoreSale.customerName = sale.customerName;
        }
        if (sale.customerEmail !== undefined && sale.customerEmail !== null) {
            firestoreSale.customerEmail = sale.customerEmail;
        }
        if (sale.notes !== undefined && sale.notes !== null) {
            firestoreSale.notes = sale.notes;
        }

        console.log('Dados que serão salvos no Firebase (Sale):', firestoreSale);

        try {
            const docRef = await this.salesCollection.add(firestoreSale);
            console.log('Venda salva no Firebase com ID:', docRef.id);

            return {
                id: docRef.id,
                productId: sale.productId,
                quantity: sale.quantity,
                unitPrice: sale.unitPrice,
                totalAmount: sale.totalAmount,
                profit: sale.profit,
                customerName: sale.customerName,
                customerEmail: sale.customerEmail,
                saleDate: sale.saleDate,
                status: sale.status,
                paymentMethod: sale.paymentMethod,
                notes: sale.notes,
                createdAt: now.toDate(),
                updatedAt: now.toDate()
            } as Sale;
        } catch (error) {
            console.error('Erro ao salvar venda no Firebase:', error);
            throw error;
        }
    }

    update(id: string, sale: Partial<Sale>): Observable<Sale> {
        return from(this.updateSale(id, sale));
    }

    private async updateSale(id: string, sale: Partial<Sale>): Promise<Sale> {
        const now = firebase.firestore.Timestamp.now();

        const updateData: any = {
            updatedAt: now
        };

        if (sale.quantity !== undefined) updateData.quantity = sale.quantity;
        if (sale.unitPrice !== undefined) updateData.unitPrice = sale.unitPrice;
        if (sale.totalAmount !== undefined) updateData.totalAmount = sale.totalAmount;
        if (sale.profit !== undefined) updateData.profit = sale.profit;
        if (sale.saleDate !== undefined) updateData.saleDate = firebase.firestore.Timestamp.fromDate(sale.saleDate);
        if (sale.status !== undefined) updateData.status = sale.status;
        if (sale.paymentMethod !== undefined) updateData.paymentMethod = sale.paymentMethod;

        if (sale.customerName !== undefined) {
            if (sale.customerName === null) {
                updateData.customerName = firebase.firestore.FieldValue.delete();
            } else {
                updateData.customerName = sale.customerName;
            }
        }
        if (sale.customerEmail !== undefined) {
            if (sale.customerEmail === null) {
                updateData.customerEmail = firebase.firestore.FieldValue.delete();
            } else {
                updateData.customerEmail = sale.customerEmail;
            }
        }
        if (sale.notes !== undefined) {
            if (sale.notes === null) {
                updateData.notes = firebase.firestore.FieldValue.delete();
            } else {
                updateData.notes = sale.notes;
            }
        }

        console.log('Dados que serão atualizados no Firebase (Sale):', updateData);

        try {
            await this.firestore.doc(`sales/${id}`).update(updateData);

            const updatedDoc = await this.firestore.doc<FirestoreSale>(`sales/${id}`).get().toPromise();

            if (updatedDoc && updatedDoc.exists) {
                const data = updatedDoc.data();
                if (data) {
                    console.log('Venda atualizada no Firebase:', data);
                    return this.convertFirestoreToSale({ id, ...data });
                }
            }

            throw new Error('Venda não encontrada após atualização');
        } catch (error) {
            console.error('Erro ao atualizar venda no Firebase:', error);
            throw error;
        }
    }

    delete(id: string): Observable<boolean> {
        return from(this.deleteSale(id));
    }

    private async deleteSale(id: string): Promise<boolean> {
        try {
            await this.firestore.doc(`sales/${id}`).delete();
            console.log('Venda removida do Firebase:', id);
            return true;
        } catch (error) {
            console.error('Erro ao remover venda do Firebase:', error);
            throw error;
        }
    }

    getTotalRevenue(startDate: Date, endDate: Date): Observable<number> {
        return this.findByDateRange(startDate, endDate).pipe(
            map(sales => sales
                .filter(sale => sale.status === SaleStatus.COMPLETED)
                .reduce((total, sale) => total + sale.totalAmount, 0)
            )
        );
    }

    getTotalProfit(startDate: Date, endDate: Date): Observable<number> {
        return this.findByDateRange(startDate, endDate).pipe(
            map(sales => sales
                .filter(sale => sale.status === SaleStatus.COMPLETED)
                .reduce((total, sale) => total + sale.profit, 0)
            )
        );
    }

    getSalesVolumeByProduct(startDate: Date, endDate: Date): Observable<{ productId: string, volume: number }[]> {
        return this.findByDateRange(startDate, endDate).pipe(
            map(sales => {
                const volumeMap = new Map<string, number>();

                sales
                    .filter(sale => sale.status === SaleStatus.COMPLETED)
                    .forEach(sale => {
                        const current = volumeMap.get(sale.productId) || 0;
                        volumeMap.set(sale.productId, current + sale.quantity);
                    });

                return Array.from(volumeMap.entries()).map(([productId, volume]) => ({
                    productId,
                    volume
                }));
            })
        );
    }

    // Método auxiliar para converter dados do Firestore para Sale
    private convertFirestoreToSale = (data: any): Sale => {
        return {
            id: data.id,
            productId: data.productId,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            totalAmount: data.totalAmount,
            profit: data.profit,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            saleDate: data.saleDate?.toDate() || new Date(),
            status: data.status,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }
}
