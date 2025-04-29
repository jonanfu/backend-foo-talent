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
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

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
          format: 'binary',
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

  @ApiTags('products')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('pdf')) // 'pdf' será el nombre del campo del archivo
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Actualizar producto y opcionalmente subir nuevo PDF',
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Nuevo nombre' },
        descripcion: { type: 'string', example: 'Nueva descripción' },
        fecha: { type: 'string', format: 'date-time', example: '2025-04-22T12:12:46.470Z' },
        pdfUrl: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productService.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
