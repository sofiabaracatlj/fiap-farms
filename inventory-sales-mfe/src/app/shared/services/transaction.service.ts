import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface newTransaction {
    accountId: string;
    type: 'Credit' | 'Debit';
    value: number;
    from?: string;
    to?: string;
    anexo?: string;
}

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    private readonly baseUrl = 'http://localhost:3000/account/transaction';

    constructor(private http: HttpClient) { }

    createTransaction(transaction: newTransaction,): Observable<any> {
        const token = sessionStorage.getItem('token') || '';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });

        return this.http.post(this.baseUrl, transaction, { headers });
    }
}