import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AccountState } from 'src/app/store/account.reducer';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent {

    clientName$: Observable<string> = new Observable<string>();

    constructor(
        private store: Store<{ accountState: AccountState }>,
        private router: Router
    ) {
        this.clientName$ = this.store.select('accountState').pipe(
            map((state: AccountState) => {
                console.log(state);
                return state.name;
            }
            )
        );
    }

    ngOninit() {
    }

    navigateTo() {
        this.router.navigate(['/home/account']);
    }
}
