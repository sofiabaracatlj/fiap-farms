import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuComponent } from 'src/app/shared/components/menu/menu.component';
import { MenuBarComponent } from 'src/app/shared/components/menu-bar/menu-bar.component';
import { SideBarMenuComponent } from 'src/app/shared/components/side-bar-menu/side-bar-menu.component';
import { BurgerMenuComponent } from 'src/app/shared/components/burger-menu/burger-menu.component';
import { AccountService } from 'src/app/shared/services/account.service';
import { BalanceComponent } from 'src/app/shared/components/balance/balance.component';
import { TransactionFormComponent } from 'src/app/shared/components/transaction-form/transaction-form.component';
import { NewTransactionComponent } from 'src/app/shared/components/new-transaction/new-transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionComponent } from 'src/app/shared/components/transaction/transaction.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TransactionService } from 'src/app/shared/services/transaction.service';
import { CentralCardComponent } from 'src/app/shared/components/central-card/central-card.component';
import { OtherServicesComponent } from 'src/app/shared/components/other-services/other-services.component';
import { CardsComponent } from 'src/app/shared/components/cards/cards.component';
import { InvestmentsComponent } from 'src/app/shared/components/investments/investments.component';
import { TransactionsPageComponent } from '../transactions/transactions-page.component';
import { UserService } from 'src/app/shared/services/user.service';
import { AccountPageComponent } from '../account/account-page.component';
import { ProgressBarComponent } from 'src/app/shared/components/progress-bar/progress-bar.component';
import { GoalsDashboardComponent } from 'src/app/shared/components/goals-dashboard/goals-dashboard.component';
import { SimpleProgressBarComponent } from 'src/app/shared/components/simple-progress-bar/simple-progress-bar.component';
// import { FirebaseModule } from 'src/app/core/config/firebase.module';
import { AddProductPageComponent } from '../add-product/add-product-page.component';
import { AddStockPageComponent } from '../add-stock/add-stock-page.component';
import { AddSalePageComponent } from '../add-sale/add-sale-page.component';
import { ProductRepository } from 'src/app/core/domain/repositories/product.repository';
import { InventoryRepository } from 'src/app/core/domain/repositories/inventory.repository';
import { SaleRepository } from 'src/app/core/domain/repositories/sale.repository';
import { FirebaseProductService } from 'src/app/core/infrastructure/firebase-product.service';
import { FirebaseInventoryService } from 'src/app/core/infrastructure/firebase-inventory.service';
import { FirebaseSaleService } from 'src/app/core/infrastructure/firebase-sale.service';
import { CreateProductUseCase } from 'src/app/core/use-cases/create-product.use-case';
import { AddStockUseCase } from 'src/app/core/use-cases/add-stock.use-case';
import { CreateSaleUseCase } from 'src/app/core/use-cases/create-sale.use-case';
// import { FirebaseModule } from 'src/app/core/config/firebase.module';


@NgModule({
    declarations: [
        HomeComponent,
        HeaderComponent,
        MenuComponent,
        MenuBarComponent,
        SideBarMenuComponent,
        BurgerMenuComponent,
        BalanceComponent,
        TransactionFormComponent,
        TransactionComponent,
        NewTransactionComponent,
        CentralCardComponent,
        OtherServicesComponent,
        CardsComponent,
        InvestmentsComponent,
        TransactionsPageComponent,
        AccountPageComponent,
        ProgressBarComponent,
        GoalsDashboardComponent,
        SimpleProgressBarComponent,
        AddProductPageComponent,
        AddStockPageComponent,
        AddSalePageComponent


    ], // Declare components
    imports: [
        CommonModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forChild([
            {
                path: 'transactions',
                component: TransactionsPageComponent
            },
            {
                path: '', // Default route for this module
                component: HomeComponent,
            },
            {
                path: 'services', // Default route for this module
                component: HomeComponent,
            },
            {
                path: 'cards', // Default route for this module
                component: HomeComponent,
            },
            {
                path: 'investments', // Default route for this module
                component: HomeComponent,
            },
            {
                path: 'account', // Default route for this module
                component: AccountPageComponent,
            },
            {
                path: 'add-product',
                component: AddProductPageComponent,
            },
            {
                path: 'add-stock',
                component: AddStockPageComponent,
            },
            {
                path: 'add-sale',
                component: AddSalePageComponent,
            }

        ]),
    ],
    exports: [], // Export the directive if needed
    providers: [
        AccountService,
        TransactionService,
        UserService,
        FirebaseProductService,
        FirebaseInventoryService,
        FirebaseSaleService,
        CreateProductUseCase,
        AddStockUseCase,
        CreateSaleUseCase,
        {
            provide: ProductRepository,
            useExisting: FirebaseProductService
        },
        {
            provide: InventoryRepository,
            useExisting: FirebaseInventoryService
        },
        {
            provide: SaleRepository,
            useExisting: FirebaseSaleService
        }
    ], // Services
})
export class HomeModule { }