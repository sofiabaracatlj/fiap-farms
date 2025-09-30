import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../domain/entities/product.entity';
import { ProductRepository } from '../domain/repositories/product.repository';

@Injectable()
export class CreateProductUseCase {
    constructor(private productRepository: ProductRepository) { }

    execute(productData: CreateProductRequest): Observable<Product> {
        console.log('CreateProductUseCase - Dados recebidos:', productData);

        // Calcular margem de lucro
        const profitMargin = this.calculateProfitMargin(productData.unitPrice, productData.costPrice);

        const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
            name: productData.name,
            category: productData.category,
            description: productData.description || '',
            unitPrice: productData.unitPrice,
            costPrice: productData.costPrice,
            imageUrl: productData.imageUrl || '',
            profitMargin
        };

        console.log('CreateProductUseCase - Produto a ser criado:', product);

        return this.productRepository.create(product);
    }

    private calculateProfitMargin(unitPrice: number, costPrice: number): number {
        if (costPrice === 0) return 0;
        return ((unitPrice - costPrice) / costPrice) * 100;
    }
}

export interface CreateProductRequest {
    name: string;
    category: string;
    description?: string;
    unitPrice: number;
    costPrice: number;
    imageUrl?: string;
}
