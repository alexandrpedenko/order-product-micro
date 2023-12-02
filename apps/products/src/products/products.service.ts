import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { Category, Product } from '@core/core';

import { CreateProductDto, UpdateProductDto } from './dto/request';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create({
      ...createProductDto,
      category: new Category(createProductDto.category)
    });


    await this.productRepository.save(product);
    return product;
  }


  async findAll(page: number, limit: number) {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    return await paginate<Product>(queryBuilder, {
      page,
      limit,
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.price', 'product.rating'])
      .where('product.id = :productId', { productId: id })
      .leftJoinAndSelect('product.category', 'category')
      .getOne();

    if (!product) {
      throw new HttpException(
        'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const updated = await this.productRepository.update({ id }, updateProductDto);
    if (updated.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return this.productRepository.findOneBy({ id });
  }

  async remove(id: number) {
    await this.productRepository.delete(id);
    return `Product #${id} removed`;
  }
}
