import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product, 'productsConnection')
    private readonly productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    console.log(process.env.DB_USERNAME)
    return this.productRepository.find();
  }

  create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }
}
