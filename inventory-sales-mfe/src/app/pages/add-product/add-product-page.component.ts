import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateProductUseCase, CreateProductRequest } from '../../core/use-cases/create-product.use-case';

interface ProductFormData {
    name: string;
    category: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    imageUrl?: string;
}

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product-page.component.html',
    styleUrls: ['./add-product-page.component.css']
})
export class AddProductPageComponent implements OnInit {
    productForm: FormGroup;
    isLoading = false;
    categories = [
        'Hortaliças',
        'Frutas',
        'Legumes',
        'Grãos',
        'Temperos',
        'Outros'
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private createProductUseCase: CreateProductUseCase,
        private ngZone: NgZone
    ) {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            category: ['', Validators.required],
            description: [''],
            unitPrice: ['', [Validators.required, Validators.min(0.01)]],
            costPrice: ['', [Validators.required, Validators.min(0.01)]],
            imageUrl: ['']
        });
    }

    ngOnInit(): void { }

    get profitMargin(): number {
        const unitPrice = this.productForm.get('unitPrice')?.value || 0;
        const costPrice = this.productForm.get('costPrice')?.value || 0;

        if (costPrice === 0) return 0;
        return ((unitPrice - costPrice) / costPrice) * 100;
    }

    onSubmit(): void {
        if (this.productForm.valid) {
            this.isLoading = true;

            const productData: CreateProductRequest = this.productForm.value;
            console.log('AddProductComponent - Dados do formulário:', productData);
            console.log('AddProductComponent - Formulário válido:', this.productForm.valid);
            console.log('AddProductComponent - Todos os valores do form:', this.productForm.getRawValue());

            this.createProductUseCase.execute(productData).subscribe({
                next: (product) => {
                    console.log('Produto criado no Firebase:', product);
                    this.isLoading = false;

                    // Mostrar mensagem de sucesso
                    alert('Produto adicionado com sucesso!');

                    // Redirecionar para página inicial
                    this.ngZone.runOutsideAngular(() => {
                        window.location.href = '/home';
                    });
                },
                error: (error) => {
                    console.error('Erro ao criar produto:', error);
                    this.isLoading = false;
                    alert('Erro ao adicionar produto. Tente novamente.');
                }
            });
        } else {
            console.log('Formulário inválido:', this.productForm.errors);
            console.log('Erros nos campos:', this.productForm.controls);
            this.markFormGroupTouched();
        }
    }

    onCancel(): void {
        this.ngZone.runOutsideAngular(() => {
            window.location.href = '/home';
        });
    }

    onReset(): void {
        this.productForm.reset();
    }

    private markFormGroupTouched(): void {
        Object.keys(this.productForm.controls).forEach(key => {
            const control = this.productForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.productForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.productForm.get(fieldName);

        if (field?.errors) {
            if (field.errors['required']) {
                return `${this.getFieldLabel(fieldName)} é obrigatório`;
            }
            if (field.errors['minlength']) {
                return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
            }
            if (field.errors['min']) {
                return `${this.getFieldLabel(fieldName)} deve ser maior que zero`;
            }
        }

        return '';
    }

    private getFieldLabel(fieldName: string): string {
        const labels: { [key: string]: string } = {
            name: 'Nome',
            category: 'Categoria',
            description: 'Descrição',
            unitPrice: 'Preço de Venda',
            costPrice: 'Preço de Custo',
            imageUrl: 'URL da Imagem'
        };

        return labels[fieldName] || fieldName;
    }
}
