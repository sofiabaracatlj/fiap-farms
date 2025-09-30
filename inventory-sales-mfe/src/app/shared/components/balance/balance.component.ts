import { Component, Input } from '@angular/core';
import { UserDTO } from '../transaction/models/userDTO';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { AccountState } from 'src/app/store/account.reducer';
import { map, Observable } from 'rxjs';

@Component({
    selector: 'app-balance',
    templateUrl: './balance.component.html',
    styleUrls: ['./balance.component.css']
})
export class BalanceComponent {
    @Input() client!: UserDTO;
    faEye = faEye;

    balance$: Observable<Number> = new Observable<Number>();

    constructor(private store: Store<{ accountState: AccountState }>) {

    }

    ngOnInit() {
        this.balance$ = this.store.select('accountState').pipe(
            map((state: AccountState) => {
                console.log(state);
                return state.balance
            })
        );
    }

    getFirstName(fullName: string): string {
        return fullName.split(' ')[0];
    }

    formatDate(date: Date): string {
        const daysOfWeek = [
            'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'
        ];
        const dayOfWeek = daysOfWeek[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();

        return `${dayOfWeek}, ${day}/${month}/${year}`;
    }

    get currentDate(): string {
        return this.formatDate(new Date());
    }
}
