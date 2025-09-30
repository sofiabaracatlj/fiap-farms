import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { Account } from 'src/app/shared/models/account';
import { Transaction } from 'src/app/shared/models/transaction';
import { AccountService } from 'src/app/shared/services/account.service';
import { UserService } from 'src/app/shared/services/user.service';
import { setAccount, setBalance, setUserName } from 'src/app/store/account.action';
import { AccountState } from 'src/app/store/account.reducer';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent {
    title = 'Welcome to Bytebank!';
    account: Account | null = null;
    account$: Observable<AccountState>;
    accountId = '';
    transactions: Transaction[] = [];

    constructor(private accountService: AccountService, private userService: UserService, private store: Store<{ accountState: AccountState }>) {
        console.log('HomeComponent created');
        this.account$ = this.store.select('accountState').pipe(
            tap((state) => {
                console.log('State', state);
            })
        );
    }


    ngOnInit() {
        this.getAccount();
        this.userService.getUser().subscribe((data) => {
            console.log('User', data.result[0].username);
            this.store.dispatch(setUserName({ name: data.result[0].username }));
        }
        );
    }

    onNewTransaction() {
        this.getAccount();
    }

    getAccount() {
        this.accountService.getAccount().subscribe((data) => {
            const result = data.result;
            this.account = {
                id: result.account[0].id,
                userId: result.account[0].userId,
                type: result.account[0].type,
                cards: result.cards,
                transactions: result.transactions,

            }
            this.accountId = this.account?.id || '';
            console.log('Account transaction', this.account.transactions);
            this.transactions = this.account.transactions;
            console.log('accountId', this.transactions);
            this.getBalance(this.account?.transactions || []);
            this.store.dispatch(setAccount({ account: this.account }));
        });
    }

    getBalance(transactions: Transaction[]) {
        const balance = this.accountService.calculateBalance(transactions);
        this.store.dispatch(
            setBalance({
                balance,
            })
        );
    }

}