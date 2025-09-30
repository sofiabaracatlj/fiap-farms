import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDTO } from './models/userDTO';
import { Transaction } from '../../models/transaction';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AccountState } from 'src/app/store/account.reducer';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnChanges {

    account$: Observable<AccountState> = this.store.select('accountState');
    transactions: Transaction[] = [];
    @Input() transactionList?: Transaction[] | null = [];

    groupedTransactions: { [key: string]: Transaction[] } = {};

    constructor(private store: Store<{ accountState: AccountState }>) { }

    ngOnInit() {
        console.log('TransactionList', this.transactionList);
        this.getTransactions();
    }

    ngOnChanges() {
        this.getTransactions();
    }

    getTransactions() {
        console.log('TransactionList', this.transactionList);
        if (this.transactionList && this.transactionList.length > 0) {
            this.transactions = this.transactionList;
            this.groupTransactionsByMonth();
            return;
        }
        this.account$.subscribe((state) => {
            this.transactions = state.account?.transactions || [];
            console.log('State', state);
            this.groupTransactionsByMonth();
        });
        console.log('Transactions', this.transactions);
    }

    groupTransactionsByMonth() {
        this.groupedTransactions = this.transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.date);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (!acc[month]) {
                acc[month] = [];
            }

            acc[month].push(transaction);
            return acc;
        }, {} as { [key: string]: Transaction[] });
    }

    capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
