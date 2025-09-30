import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoreModule } from '@ngrx/store';
import { accountReducer } from './store/account.reducer';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';

console.log('AppModule - Firebase config:', environment.firebase);
console.log('AppModule - Environment features:', environment.features);

// Components
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Repositories and Services
import { ProductRepository } from './core/domain/repositories/product.repository';
import { InventoryRepository } from './core/domain/repositories/inventory.repository';
import { SaleRepository } from './core/domain/repositories/sale.repository';
import { FirebaseProductService } from './core/infrastructure/firebase-product.service';
import { FirebaseInventoryService } from './core/infrastructure/firebase-inventory.service';
import { FirebaseSaleService } from './core/infrastructure/firebase-sale.service';
import { FirebaseAuthInterceptor } from './core/infrastructure/firebase-auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    // DashboardComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    FontAwesomeModule,
    StoreModule.forRoot({ accountState: accountReducer }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [
    { provide: ProductRepository, useClass: FirebaseProductService },
    { provide: InventoryRepository, useClass: FirebaseInventoryService },
    { provide: SaleRepository, useClass: FirebaseSaleService },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FirebaseAuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
