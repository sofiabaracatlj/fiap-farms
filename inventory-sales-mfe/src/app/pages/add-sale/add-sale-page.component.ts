import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CreateSaleUseCase, CreateSaleRequest } from '../../core/use-cases/create-sale.use-case';
import { Product } from '../../core/domain/entities/product.entity';
import { SaleStatus, PaymentMethod } from '../../core/domain/entities/sale.entity';
import { ProductRepository } from '../../core/domain/repositories/product.repository';

@Component({
    selector: 'app-add-sale',
    templateUrl: './add-sale-page.component.html',
    styleUrls: ['./add-sale-page.component.css']
})
export class AddSalePageComponent implements OnInit {
    saleForm: FormGroup;
    isLoading = false;
    products$: Observable<Product[]>;
    selectedProduct: Product | null = null;

    paymentMethods = [
        { value: PaymentMethod.CASH, label: 'Dinheiro' },
        { value: PaymentMethod.PIX, label: 'PIX' },
        { value: PaymentMethod.CREDIT_CARD, label: 'Cartão de Crédito' },
        { value: PaymentMethod.DEBIT_CARD, label: 'Cartão de Débito' },
        { value: PaymentMethod.BANK_TRANSFER, label: 'Transferência Bancária' }
    ];

    saleStatuses = [
        { value: SaleStatus.COMPLETED, label: 'Concluída' },
        { value: SaleStatus.PENDING, label: 'Pendente' }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private createSaleUseCase: CreateSaleUseCase,
        private productRepository: ProductRepository,
        private ngZone: NgZone
    ) {
        this.saleForm = this.fb.group({
            productId: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            unitPrice: ['', [Validators.min(0.01)]],
            customerName: [''],
            customerEmail: ['', Validators.email],
            saleDate: [this.formatDateForInput(new Date()), Validators.required],
            status: [SaleStatus.COMPLETED, Validators.required],
            paymentMethod: ['', Validators.required],
            notes: ['']
        });

        this.products$ = this.productRepository.findAll();
    }

    ngOnInit(): void {
        // Observar mudanças no produto selecionado
        this.saleForm.get('productId')?.valueChanges.subscribe(productId => {
            this.onProductChange(productId);
        });

        // Observar mudanças na quantidade e preço para recalcular totais
        this.saleForm.get('quantity')?.valueChanges.subscribe(() => {
            this.calculateTotals();
        });
        this.saleForm.get('unitPrice')?.valueChanges.subscribe(() => {
            this.calculateTotals();
        });

        console.log('AddSalePage inicializada');
    }

    onProductChange(productId: string): void {
        if (!productId) {
            this.selectedProduct = null;
            return;
        }

        this.productRepository.findById(productId).subscribe(product => {
            if (product) {
                this.selectedProduct = product;
                // Auto-preencher preço unitário com o preço do produto
                this.saleForm.patchValue({
                    unitPrice: product.unitPrice
                });
                this.calculateTotals();
            }
        });
    }

    calculateTotals(): void {
        // Este método será usado no template para mostrar cálculos em tempo real
    }

    get totalAmount(): number {
        const quantity = this.saleForm.get('quantity')?.value || 0;
        const unitPrice = this.saleForm.get('unitPrice')?.value || 0;
        return quantity * unitPrice;
    }

    get estimatedProfit(): number {
        if (!this.selectedProduct) return 0;
        const quantity = this.saleForm.get('quantity')?.value || 0;
        const unitPrice = this.saleForm.get('unitPrice')?.value || 0;
        return (unitPrice - this.selectedProduct.costPrice) * quantity;
    }

    get profitMargin(): number {
        if (!this.selectedProduct) return 0;
        const unitPrice = this.saleForm.get('unitPrice')?.value || 0;
        if (unitPrice === 0) return 0;
        return ((unitPrice - this.selectedProduct.costPrice) / unitPrice) * 100;
    }

    onSubmit(): void {
        if (this.saleForm.valid) {
            this.isLoading = true;

            const formValue = this.saleForm.getRawValue();
            console.log('AddSaleComponent - Dados do formulário:', formValue);

            const request: CreateSaleRequest = {
                productId: formValue.productId,
                quantity: Number(formValue.quantity),
                unitPrice: formValue.unitPrice ? Number(formValue.unitPrice) : undefined,
                customerName: formValue.customerName || undefined,
                customerEmail: formValue.customerEmail || undefined,
                saleDate: formValue.saleDate ? new Date(formValue.saleDate) : new Date(),
                status: formValue.status as SaleStatus,
                paymentMethod: formValue.paymentMethod as PaymentMethod,
                notes: formValue.notes || undefined
            };

            console.log('AddSaleComponent - Request preparado:', request);

            this.createSaleUseCase.execute(request).subscribe({
                next: (sale) => {
                    console.log('Venda criada:', sale);
                    this.isLoading = false;

                    // Mostrar mensagem de sucesso
                    alert(`Venda registrada com sucesso!\nTotal: R$ ${sale.totalAmount.toFixed(2)}\nLucro: R$ ${sale.profit.toFixed(2)}`);

                    // Redirecionar para página inicial
                    this.ngZone.runOutsideAngular(() => {
                        window.location.href = '/home';
                    });
                },
                error: (error) => {
                    console.error('Erro ao criar venda:', error);
                    this.isLoading = false;
                    let errorMessage = 'Erro ao registrar venda. Tente novamente.';

                    if (error.message.includes('Estoque insuficiente')) {
                        errorMessage = error.message;
                    } else if (error.message.includes('Produto não encontrado')) {
                        errorMessage = 'Produto não encontrado. Selecione um produto válido.';
                    }

                    alert(errorMessage);
                }
            });
        } else {
            console.log('Formulário inválido:', this.saleForm.errors);
            console.log('Erros nos campos:', this.saleForm.controls);
            this.markFormGroupTouched();
        }
    }

    onCancel(): void {
        this.ngZone.runOutsideAngular(() => {
            window.location.href = '/home';
        });
    }

    onReset(): void {
        this.selectedProduct = null;
        this.saleForm.reset({
            saleDate: this.formatDateForInput(new Date()),
            status: SaleStatus.COMPLETED
        });
    }

    private formatDateForInput(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private markFormGroupTouched(): void {
        Object.keys(this.saleForm.controls).forEach(key => {
            const control = this.saleForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.saleForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.saleForm.get(fieldName);

        if (field?.errors) {
            if (field.errors['required']) {
                return `${this.getFieldLabel(fieldName)} é obrigatório`;
            }
            if (field.errors['min']) {
                const minValue = field.errors['min'].min;
                return `${this.getFieldLabel(fieldName)} deve ser maior ou igual a ${minValue}`;
            }
            if (field.errors['email']) {
                return 'Email deve ter um formato válido';
            }
        }

        return '';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            productId: 'Produto',
            quantity: 'Quantidade',
            unitPrice: 'Preço Unitário',
            customerName: 'Nome do Cliente',
            customerEmail: 'Email do Cliente',
            saleDate: 'Data da Venda',
            status: 'Status',
            paymentMethod: 'Forma de Pagamento',
            notes: 'Observações'
        };

        return labels[fieldName] || fieldName;
    }
}
