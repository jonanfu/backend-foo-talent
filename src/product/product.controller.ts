// src/tasks/tasks.controller.ts
import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
    UploadedFile, Query, Req,
    UseGuards
  } from '@nestjs/common';
  import { ProductService } from './product.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { UpdateProductDto } from './dto/update-product.dto';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiConsumes, ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
  
  @ApiTags('Products')
  @ApiBearerAuth('access-token')
  @Controller('products')
  export class ProductController {
    constructor(private readonly productService: ProductService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'Crea un producto con un PDF',
      schema: {
        type: 'object',
        properties: {
          nombre: { type: 'string' },
          descripcion: { type: 'string' },
          fecha: { type: 'string', format: 'date-time' },
          file: {
            type: 'string',
            format: 'binary', // 👈 esto permite subir el archivo en Swagger
          },
        },
      },
    })
    @ApiOperation({ summary: 'Crear un producto con archivo PDF' })
    @ApiResponse({ status: 201, description: 'Producto creado' })
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
  