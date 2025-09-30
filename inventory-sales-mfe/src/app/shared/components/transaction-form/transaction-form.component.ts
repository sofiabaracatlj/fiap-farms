import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { newTransaction } from '../../services/transaction.service';

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
    @Input() initialTransaction: Partial<newTransaction> | null = null;
    @Output() onSubmit = new EventEmitter<newTransaction>();
    @Output() onCancel = new EventEmitter<void>();

    transactionForm!: FormGroup;
    transactionTypes = [
        { value: 'Credit', label: 'Crédito' },
        { value: 'Debit', label: 'Débito' }
    ];

    type = new FormControl(this.initialTransaction?.type || 'Credit', Validators.required);
    value = new FormControl(
        this.initialTransaction?.value || '',
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]
    );
    from = new FormControl(this.initialTransaction?.from || '',);
    to = new FormControl(this.initialTransaction?.to || '',);
    anexo: string = '';


    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.transactionForm = this.fb.group({
            type: this.type,
            value: this.value,
            from: this.from,
            to: this.to,
            anexo: this.anexo
        });
    }

    submitForm(): void {
        if (this.transactionForm.valid) {
            const newTransaction = {
                accountId: '',
                type: this.transactionForm.value.type,
                value: Number(this.transactionForm.value.value),
                from: this.transactionForm.value.from,
                to: this.transactionForm.value.to,
                anexo: this.transactionForm.value.anexo
            };
            console.log(newTransaction);
            this.onSubmit.emit(this.transactionForm.value);
        }
    }

    convertFile(event: any) {
        console.log("event", event);
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.anexo = reader.result as string;
            console.log("file", reader.result);
        };
    }

    cancel(): void {
        this.onCancel.emit();
    }
}
