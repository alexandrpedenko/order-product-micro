import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, DefaultValuePipe, Query, Inject, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { User, AuthCommands, CLIENT_PROXY_SERVICE, AuthGuard, Roles, UserRoles } from '@core/core';
import { CreateProductDto, UpdateProductDto } from '../dto/request';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CLIENT_PROXY_SERVICE.Auth) private readonly authService: ClientProxy,
  ) { }

  // NOTE: Test endpoint for checking  rabbitmq functionality
  @UseGuards(AuthGuard)
  @Get('user/:id')
  @Roles(UserRoles.Vendor, UserRoles.Customer)
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return firstValueFrom(
      this.authService.send<User>(
        { cmd: AuthCommands.getUser },
        { id },
      )
    );
  }

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.productsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
