import { Injectable, NgZone } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Product, ProductMetrics } from '../domain/entities/product.entity';
import { ProductRepository } from '../domain/repositories/product.repository';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { SessionAuthService } from '../services/session-auth.service';
import firebase from 'firebase/compat/app';

// Interface para dados do Firestore
interface FirestoreProduct {
    name: string;
    category: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    imageUrl?: string;
    profitMargin: number;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
}

@Injectable({
    providedIn: 'root'
})
export class FirebaseProductService implements ProductRepository {
    private productsCollection: AngularFirestoreCollection<FirestoreProduct>;

    constructor(
        private ngZone: NgZone,
        private firestore: AngularFirestore,
        private afAuth: AngularFireAuth,
        private sessionAuthService: SessionAuthService
    ) {
        console.log('FirebaseProductService - Constructor chamado');
        console.log('FirebaseProductService - AngularFirestore instance:', this.firestore);

        try {
            this.productsCollection = this.firestore.collection<FirestoreProduct>('products');
            console.log('FirebaseProductService - Products collection criada:', this.productsCollection);

            // Garantir que a autenticação esteja configurada
            this.ensureAuthentication();
        } catch (error) {
            console.error('FirebaseProductService - Erro ao criar collection:', error);
        }
    }

    create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
        return from(this.ensureAuthenticatedOperation(() => this.createProduct(product)));
    }

    private async ensureAuthentication(): Promise<void> {
        try {
            await this.sessionAuthService.initializeAuthFromSession();
            const isAuth = await this.sessionAuthService.isAuthenticated();
            console.log('FirebaseProductService - Status de autenticação:', isAuth);
        } catch (error) {
            console.error('FirebaseProductService - Erro ao garantir autenticação:', error);
        }
    }

    private async ensureAuthenticatedOperation<T>(operation: () => Promise<T>): Promise<T> {
        try {
            // Verificar se o usuário está autenticado
            const isAuthenticated = await this.sessionAuthService.isAuthenticated();

            if (!isAuthenticated) {
                console.log('FirebaseProductService - Usuário não autenticado, tentando restaurar sessão');
                await this.sessionAuthService.initializeAuthFromSession();

                // Verificar novamente
                const isAuthAfterRestore = await this.sessionAuthService.isAuthenticated();
                if (!isAuthAfterRestore) {
                    throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
                }
            }

            return await operation();
        } catch (error) {
            console.error('FirebaseProductService - Erro na operação autenticada:', error);
            throw error;
        }
    }

    private async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const now = firebase.firestore.Timestamp.now();

        // Criar objeto com todos os campos explicitamente
        const firestoreProduct: FirestoreProduct = {
            name: product.name,
            category: product.category,
            description: product.description || '',
            unitPrice: product.unitPrice,
            costPrice: product.costPrice,
            profitMargin: product.profitMargin,
            imageUrl: product.imageUrl || '',
            createdAt: now,
            updatedAt: now
        };

        console.log('Dados que serão salvos no Firebase:', firestoreProduct);

        try {
            const docRef = await this.productsCollection.add(firestoreProduct);
            console.log('Produto salvo no Firebase com ID:', docRef.id);

            return {
                id: docRef.id,
                name: product.name,
                category: product.category,
                description: product.description || '',
                unitPrice: product.unitPrice,
                costPrice: product.costPrice,
                profitMargin: product.profitMargin,
                imageUrl: product.imageUrl || '',
                createdAt: now.toDate(),
                updatedAt: now.toDate()
            } as Product;
        } catch (error) {
            console.error('Erro ao salvar produto no Firebase:', error);
            throw error;
        }
    }

    findAll(): Observable<Product[]> {
        console.log('FirebaseProductService - Carregando todos os produtos do Firebase');
        console.log('FirebaseProductService - Firestore instance:', this.firestore);
        console.log('FirebaseProductService - Products collection:', this.productsCollection);

        return from(this.sessionAuthService.isAuthenticated()).pipe(
            switchMap(async (isAuth) => {
                if (!isAuth) {
                    console.log('FirebaseProductService - Usuário não autenticado, restaurando sessão');
                    await this.sessionAuthService.initializeAuthFromSession();
                }
                return this.productsCollection.valueChanges({ idField: 'id' });
            }),
            switchMap(observable => observable),
            map(products => {
                console.log('FirebaseProductService - Produtos recebidos do Firebase:', products);
                return products.map(this.convertFirestoreToProduct);
            }),
            catchError(error => {
                console.error('FirebaseProductService - Erro ao carregar produtos:', error);
                throw error;
            })
        );
    }

    findById(id: string): Observable<Product | null> {
        return from(this.sessionAuthService.isAuthenticated()).pipe(
            switchMap(async (isAuth) => {
                if (!isAuth) {
                    await this.sessionAuthService.initializeAuthFromSession();
                }
                return this.firestore.doc<FirestoreProduct>(`products/${id}`).valueChanges({ idField: 'id' });
            }),
            switchMap(observable => observable),
            map(product => product ? this.convertFirestoreToProduct(product) : null)
        );
    }

    findByCategory(category: string): Observable<Product[]> {
        return from(this.sessionAuthService.isAuthenticated()).pipe(
            switchMap(async (isAuth) => {
                if (!isAuth) {
                    await this.sessionAuthService.initializeAuthFromSession();
                }
                return this.firestore.collection<FirestoreProduct>('products', ref =>
                    ref.where('category', '==', category)
                ).valueChanges({ idField: 'id' });
            }),
            switchMap(observable => observable),
            map(products => products.map(this.convertFirestoreToProduct))
        );
    }

    update(id: string, product: Partial<Product>): Observable<Product> {
        return from(this.ensureAuthenticatedOperation(() => this.updateProduct(id, product)));
    }

    private async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
        const now = firebase.firestore.Timestamp.now();

        // Criar objeto de atualização apenas com campos definidos
        const updateData: any = {
            updatedAt: now
        };

        if (product.name !== undefined) updateData.name = product.name;
        if (product.category !== undefined) updateData.category = product.category;
        if (product.description !== undefined) updateData.description = product.description;
        if (product.unitPrice !== undefined) updateData.unitPrice = product.unitPrice;
        if (product.costPrice !== undefined) updateData.costPrice = product.costPrice;
        if (product.profitMargin !== undefined) updateData.profitMargin = product.profitMargin;
        if (product.imageUrl !== undefined) updateData.imageUrl = product.imageUrl;

        console.log('Dados que serão atualizados no Firebase:', updateData);

        try {
            await this.firestore.doc(`products/${id}`).update(updateData);

            // Buscar o produto atualizado
            const updatedDoc = await this.firestore.doc<FirestoreProduct>(`products/${id}`).get().toPromise();

            if (updatedDoc && updatedDoc.exists) {
                const data = updatedDoc.data();
                if (data) {
                    console.log('Produto atualizado no Firebase:', data);
                    return this.convertFirestoreToProduct({ id, ...data });
                }
            }

            throw new Error('Produto não encontrado após atualização');
        } catch (error) {
            console.error('Erro ao atualizar produto no Firebase:', error);
            throw error;
        }
    }

    delete(id: string): Observable<boolean> {
        return from(this.ensureAuthenticatedOperation(() => this.deleteProduct(id)));
    }

    private async deleteProduct(id: string): Promise<boolean> {
        try {
            await this.firestore.doc(`products/${id}`).delete();
            console.log('Produto removido do Firebase:', id);
            return true;
        } catch (error) {
            console.error('Erro ao remover produto do Firebase:', error);
            throw error;
        }
    }

    getProductMetrics(productId: string, startDate: Date, endDate: Date): Observable<ProductMetrics> {
        return from(this.calculateProductMetrics(productId, startDate, endDate));
    }

    private async calculateProductMetrics(productId: string, startDate: Date, endDate: Date): Promise<ProductMetrics> {
        await this.ngZone.runOutsideAngular(() =>
            new Promise(resolve => setTimeout(resolve, 600))
        );

        // Simular cálculo de métricas
        return {
            productId,
            totalSales: Math.floor(Math.random() * 1000) + 100,
            totalProfit: Math.floor(Math.random() * 5000) + 500,
            profitMargin: Math.floor(Math.random() * 30) + 15,
            salesVolume: Math.floor(Math.random() * 500) + 50,
            period: {
                startDate,
                endDate
            }
        };
    }

    getTopProfitableProducts(limit: number): Observable<Product[]> {
        return from(this.sessionAuthService.isAuthenticated()).pipe(
            switchMap(async (isAuth) => {
                if (!isAuth) {
                    await this.sessionAuthService.initializeAuthFromSession();
                }
                return this.productsCollection.valueChanges({ idField: 'id' });
            }),
            switchMap(observable => observable),
            map(products => {
                const convertedProducts = products.map(this.convertFirestoreToProduct);
                return convertedProducts
                    .sort((a, b) => (b.profitMargin || 0) - (a.profitMargin || 0))
                    .slice(0, limit);
            })
        );
    }

    // Método auxiliar para converter dados do Firestore para Product
    private convertFirestoreToProduct = (data: any): Product => {
        return {
            id: data.id,
            name: data.name,
            category: data.category,
            description: data.description,
            unitPrice: data.unitPrice,
            costPrice: data.costPrice,
            profitMargin: data.profitMargin,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Método para popular dados iniciais no Firebase (apenas para desenvolvimento)
    async populateInitialData(): Promise<void> {
        console.log('FirebaseProductService - Populando dados iniciais...');

        const initialProducts = [
            {
                name: 'Tomates Orgânicos',
                description: 'Tomates orgânicos frescos, cultivados sem agrotóxicos',
                category: 'Vegetais',
                unitPrice: 8.50,
                costPrice: 4.20,
                profitMargin: 50.59,
                imageUrl: 'https://example.com/tomates.jpg'
            },
            {
                name: 'Alface Hidropônica',
                description: 'Alface crespa hidropônica, folhas verdes e crocantes',
                category: 'Vegetais',
                unitPrice: 5.00,
                costPrice: 2.50,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/alface.jpg'
            },
            {
                name: 'Cenouras Baby',
                description: 'Cenouras baby doces e tenras',
                category: 'Vegetais',
                unitPrice: 12.00,
                costPrice: 6.00,
                profitMargin: 50.00,
                imageUrl: 'https://example.com/cenouras.jpg'
            }
        ];

        try {
            for (const product of initialProducts) {
                await this.createProduct(product);
                console.log(`Produto criado: ${product.name}`);
            }
            console.log('FirebaseProductService - Dados iniciais criados com sucesso!');
        } catch (error) {
            console.error('FirebaseProductService - Erro ao criar dados iniciais:', error);
        }
    }
}
