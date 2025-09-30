import { transition } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { Transaction } from 'src/app/shared/models/transaction';
import { AccountState } from 'src/app/store/account.reducer';

@Component({
    selector: 'app-transactions-page',
    templateUrl: './transactions-page.component.html',
    styleUrls: ['./transactions-page.component.css']
})
export class TransactionsPageComponent implements OnInit {
    transactionTypeFilter = new FormControl('');
    options = [
        { value: '', label: 'Todas' },
        { value: 'Credit', label: 'Crédito' },
        { value: 'Debit', label: 'Débito' },
    ];

    private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
    transactions$: Observable<Transaction[]> = this.transactionsSubject.asObservable();
    transactions: Transaction[] = [];


    constructor(private store: Store<{ accountState: AccountState }>) { }

    ngOnInit(): void {

        this.store.select('accountState').pipe(
            map((state) => state.account?.transactions || []),
            tap((transactions) => {
                this.transactions = transactions;
                this.loadTransactions(transactions);
            })
        ).subscribe();
    }

    filterTransactions(): void {
        const filteredTransactions = this.transactions.filter((transaction) => {
            if (this.transactionTypeFilter.value === '') {
                return transaction;
            }
            return transaction.type === this.transactionTypeFilter.value;
        }
        );
        this.loadTransactions(filteredTransactions);
    }

    loadTransactions(transactions: Transaction[]): void {
        this.transactionsSubject.next(transactions);
    }
}