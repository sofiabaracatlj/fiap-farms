import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from './firebase.config';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule.enablePersistence({
            synchronizeTabs: true
        }),
        AngularFireAuthModule
    ],
    exports: [
        AngularFireModule,
        AngularFirestoreModule,
        AngularFireAuthModule
    ]
})
export class FirebaseModule { }
