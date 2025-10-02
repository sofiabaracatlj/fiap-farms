import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
    providedIn: 'root'
})
export class FirebaseTestService {
    constructor(private firestore: AngularFirestore) { }

    async testConnection() {
        console.log('=== TESTE DE CONEXÃO FIREBASE ===');

        try {
            // Verificar se há dados na collection de sales
            const salesSnapshot = await this.firestore.collection('sales').get().toPromise();
            console.log('Sales collection - Documentos encontrados:', salesSnapshot?.size || 0);

            if (salesSnapshot && salesSnapshot.size > 0) {
                salesSnapshot.docs.forEach((doc, index) => {
                    console.log(`Sale ${index + 1}:`, doc.data());
                });
            }

            // Verificar se há dados na collection de products
            const productsSnapshot = await this.firestore.collection('products').get().toPromise();
            console.log('Products collection - Documentos encontrados:', productsSnapshot?.size || 0);

            // Verificar se há dados na collection de inventories
            const inventoriesSnapshot = await this.firestore.collection('inventories').get().toPromise();
            console.log('Inventories collection - Documentos encontrados:', inventoriesSnapshot?.size || 0);

            console.log('=== FIM DO TESTE ===');

        } catch (error) {
            console.error('Erro no teste de conexão:', error);
        }
    }
}
