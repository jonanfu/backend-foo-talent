// src/tasks/tasks.controller.ts
import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
    UploadedFile, Query, Req
  } from '@nestjs/common';
  import { ProductService } from './product.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiConsumes, ApiBearerAuth, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
  
  @ApiTags('Products')
  @ApiBearerAuth()
  @Controller('products')
  export class ProductController {
    constructor(private readonly productService: ProductService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Crear nuevo Producto' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateProductDto })
    create(
      @Body() dto: CreateProductDto,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: any
    ) {
      return this.productService.create(dto, req.user.uid, file);
    }
  
    @Get()
    findAll(
      @Query('search') search: string,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      return this.productService.findAll(search, Number(page), Number(limit));
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.productService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
      return this.productService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.productService.remove(id);
    }
  }
  