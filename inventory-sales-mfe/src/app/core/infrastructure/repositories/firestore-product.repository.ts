import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import {
    Firestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    CollectionReference,
    Timestamp
} from '@angular/fire/firestore';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product, ProductMetrics } from '../../domain/entities/product.entity';

@Injectable({
    providedIn: 'root'
})
export class FirestoreProductRepository implements ProductRepository {
    private productsCollection: CollectionReference;

    constructor(private firestore: Firestore) {
        this.productsCollection = collection(this.firestore, 'products');
    }

    findAll(): Observable<Product[]> {
        return from(getDocs(this.productsCollection)).pipe(
            map(snapshot =>
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data()['createdAt']?.toDate(),
                    updatedAt: doc.data()['updatedAt']?.toDate()
                } as Product))
            )
        );
    }

    findById(id: string): Observable<Product | null> {
        const docRef = doc(this.firestore, 'products', id);
        return from(getDoc(docRef)).pipe(
            map(doc => {
                if (!doc.exists()) return null;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data()['createdAt']?.toDate(),
                    updatedAt: doc.data()['updatedAt']?.toDate()
                } as Product;
            })
        );
    }

    findByCategory(category: string): Observable<Product[]> {
        const q = query(this.productsCollection, where('category', '==', category));
        return from(getDocs(q)).pipe(
            map(snapshot =>
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data()['createdAt']?.toDate(),
                    updatedAt: doc.data()['updatedAt']?.toDate()
                } as Product))
            )
        );
    }

    create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
        const now = Timestamp.now();
        const productData = {
            ...product,
            createdAt: now,
            updatedAt: now
        };

        return from(addDoc(this.productsCollection, productData)).pipe(
            map(docRef => ({
                id: docRef.id,
                ...product,
                createdAt: now.toDate(),
                updatedAt: now.toDate()
            } as Product))
        );
    }

    update(id: string, product: Partial<Product>): Observable<Product> {
        const docRef = doc(this.firestore, 'products', id);
        const updateData = {
            ...product,
            updatedAt: Timestamp.now()
        };

        return from(updateDoc(docRef, updateData)).pipe(
            map(() => ({
                id,
                ...product,
                updatedAt: new Date()
            } as Product))
        );
    }

    delete(id: string): Observable<boolean> {
        const docRef = doc(this.firestore, 'products', id);
        return from(deleteDoc(docRef)).pipe(
            map(() => true)
        );
    }

    getProductMetrics(productId: string, startDate: Date, endDate: Date): Observable<ProductMetrics> {
        // Implementação simplificada - deveria calcular com base nas vendas
        return new Observable(observer => {
            observer.next({
                productId,
                totalSales: 0,
                totalProfit: 0,
                profitMargin: 0,
                salesVolume: 0,
                period: { startDate, endDate }
            });
            observer.complete();
        });
    }

    getTopProfitableProducts(limitCount: number): Observable<Product[]> {
        const q = query(
            this.productsCollection,
            orderBy('profitMargin', 'desc'),
            limit(limitCount)
        );

        return from(getDocs(q)).pipe(
            map(snapshot =>
                snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data()['createdAt']?.toDate(),
                    updatedAt: doc.data()['updatedAt']?.toDate()
                } as Product))
            )
        );
    }
}
