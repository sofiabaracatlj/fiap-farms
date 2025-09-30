import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../../models/transaction';
import { newTransaction, TransactionService } from '../../services/transaction.service';

@Component({
    selector: 'app-new-transaction',
    templateUrl: './new-transaction.component.html',
    styleUrls: ['./new-transaction.component.css']
})
export class NewTransactionComponent {

    @Input() accountId: string = '';
    @Output() onTransactionSuccessEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor(private transactionService: TransactionService,) {
        console.log('NewTransactionComponent created', this.accountId);
    }


    handleSubmit(transaction: Partial<newTransaction>) {
        console.log('accountId', this.accountId);
        const newTransaction: newTransaction = {
            accountId: this.accountId,
            type: transaction.type || 'Credit',
            value: transaction.value || 0,
            from: transaction.from,
            to: transaction.to,
            anexo: transaction.anexo
        };
        this.transactionService.createTransaction(newTransaction).subscribe(() => {
            this.onTransactionSuccess();
        });


    }

    onTransactionSuccess() {
        this.onTransactionSuccessEmitter.emit();
    }

    onCancel() {
        console.log('cancel');
    }
}