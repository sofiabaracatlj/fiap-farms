import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Transaction } from "../models/transaction";


@Injectable({
    providedIn: 'root'
})
export class AccountService {
    url = 'http://localhost:3000/account';

    constructor(private http: HttpClient) { }

    getAccount(): Observable<any> {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        return this.http.get(this.url, { headers });
    }

    calculateBalance(transactions: Transaction[]): number {
        return transactions.reduce(
            (acc, transaction) => {
                acc += transaction.value;
                return acc;
            }, 0);
    }
}