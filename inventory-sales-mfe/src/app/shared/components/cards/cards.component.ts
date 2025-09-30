import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccountState } from 'src/app/store/account.reducer';
import { Card } from '../../models/account';

@Component({
    selector: 'app-cards',
    templateUrl: './cards.component.html',
    styles: []
})
export class CardsComponent {

    account$ = this.store.select('accountState');
    cards: Card[] = [];

    constructor(private store: Store<{ accountState: AccountState }>) { }

    ngOnInit() {
        this.account$.subscribe((state) => {
            this.cards = state.account?.cards || [];
        });
    }
    configureCard(card: any) {
        console.log('Configuring card:', card);
    }

    blockCard(card: any) {
        console.log('Blocking card:', card);
    }
}
