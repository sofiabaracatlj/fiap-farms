import { Component, EventEmitter, Input, Output, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Account } from '../../models/account';
import { AccountState } from 'src/app/store/account.reducer';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-central-card',
    templateUrl: './central-card.component.html',
    styleUrls: ['./central-card.component.css']
})
export class CentralCardComponent {
    accountId: string = '';
    account$: Observable<AccountState> = this.store.select('accountState');
    @Output() onNewTransactionEmitter: EventEmitter<void> = new EventEmitter<void>();
    page: string = '/home';

    constructor(private store: Store<{ accountState: AccountState }>, private ngZone: NgZone) {
        console.log('CentralCardComponent created', this.accountId);
        this.ngZone.runOutsideAngular(() => {
            this.page = window.location.pathname;
        });
        console.log('Page', this.page);

    }

    ngOnInit() {
        this.account$.subscribe((state) => {
            this.accountId = state.account?.id || '';
            console.log('State', state);
        });
    }

    onNewTransaction() {
        this.onNewTransactionEmitter.emit();
    }
}
