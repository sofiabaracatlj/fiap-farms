import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddStockUseCase, AddStockRequest } from '../../core/use-cases/add-stock.use-case';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductRepository } from '../../core/domain/repositories/product.repository';

@Component({
    selector: 'app-add-stock',
    templateUrl: './add-stock-page.component.html',
    styleUrls: ['./add-stock-page.component.css']
})
export class AddStockPageComponent implements OnInit {
    stockForm: FormGroup;
    isLoading = false;
    products$: Observable<Product[]>;

    movementReasons = [
        'Produção Própria',
        'Compra de Fornecedor',
        'Ajuste de Inventário',
        'Doação Recebida',
        'Correção de Sistema',
        'Outros'
    ];

    locations = [
        'Armazém Principal',
        'Galpão A',
        'Galpão B',
        'Estoque Refrigerado',
        'Área Externa',
        'Outros'
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private addStockUseCase: AddStockUseCase,
        private productRepository: ProductRepository,
        private ngZone: NgZone
    ) {
        this.stockForm = this.fb.group({
            productId: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            unitPrice: ['', [Validators.min(0)]],
            reason: ['', Validators.required],
            location: [''],
            expirationDate: [''],
            minimumStock: ['10', [Validators.min(0)]],
            maximumStock: ['1000', [Validators.min(1)]],
            notes: ['']
        });

        this.products$ = this.productRepository.findAll();
    }

    ngOnInit(): void {
        console.log('AddStockPage inicializada');
    }

    get totalValue(): number {
        const quantity = this.stockForm.get('quantity')?.value || 0;
        const unitPrice = this.stockForm.get('unitPrice')?.value || 0;
        return quantity * unitPrice;
    }

    onSubmit(): void {
        if (this.stockForm.valid) {
            this.isLoading = true;

            const formValue = this.stockForm.getRawValue();
            console.log('AddStockComponent - Dados do formulário:', formValue);

            const request: AddStockRequest = {
                productId: formValue.productId,
                quantity: Number(formValue.quantity),
                unitPrice: formValue.unitPrice ? Number(formValue.unitPrice) : undefined,
                reason: formValue.reason,
                location: formValue.location || undefined,
                expirationDate: formValue.expirationDate ? new Date(formValue.expirationDate) : undefined,
                minimumStock: Number(formValue.minimumStock) || 10,
                maximumStock: Number(formValue.maximumStock) || 1000,
                performedBy: 'Sistema',
                notes: formValue.notes || undefined
            };

            console.log('AddStockComponent - Request preparado:', request);

            this.addStockUseCase.execute(request).subscribe({
                next: (result) => {
                    console.log('Estoque adicionado:', result);
                    this.isLoading = false;

                    // Mostrar mensagem de sucesso
                    alert(`Estoque adicionado com sucesso!\n${result.movement.quantity} unidades de ${result.inventory.productId}`);

                    // Redirecionar para página inicial
                    this.ngZone.runOutsideAngular(() => {
                        window.location.href = '/home';
                    });
                },
                error: (error) => {
                    console.error('Erro ao adicionar estoque:', error);
                    this.isLoading = false;
                    alert('Erro ao adicionar estoque. Tente novamente.');
                }
            });
        } else {
            console.log('Formulário inválido:', this.stockForm.errors);
            console.log('Erros nos campos:', this.stockForm.controls);
            this.markFormGroupTouched();
        }
    }

    onCancel(): void {
        this.ngZone.runOutsideAngular(() => {
            window.location.href = '/home';
        });
    }

    onReset(): void {
        this.stockForm.reset({
            minimumStock: 10,
            maximumStock: 1000
        });
    }

    private markFormGroupTouched(): void {
        Object.keys(this.stockForm.controls).forEach(key => {
            const control = this.stockForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.stockForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.stockForm.get(fieldName);

        if (field?.errors) {
            if (field.errors['required']) {
                return `${this.getFieldLabel(fieldName)} é obrigatório`;
            }
            if (field.errors['min']) {
                const minValue = field.errors['min'].min;
                return `${this.getFieldLabel(fieldName)} deve ser maior ou igual a ${minValue}`;
            }
        }

        return '';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            productId: 'Produto',
            quantity: 'Quantidade',
            unitPrice: 'Preço Unitário',
            reason: 'Motivo',
            location: 'Localização',
            expirationDate: 'Data de Vencimento',
            minimumStock: 'Estoque Mínimo',
            maximumStock: 'Estoque Máximo',
            notes: 'Observações'
        };

        return labels[fieldName] || fieldName;
    }
}
