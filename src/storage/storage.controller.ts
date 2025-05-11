import { Controller, Post, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { StorageService } from './storage.service';
import { GetSignedUrlDto } from './dto/get-signed-url.dto/get-signed-url.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Logger } from '@nestjs/common';

@ApiTags('Storage')
@ApiBearerAuth('access-token')
@Controller('storage')
export class StorageController {
    private readonly logger = new Logger(StorageController.name);

    constructor(private readonly storageService: StorageService) { }

    @Post('signed-url')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Obtener una URL firmada para un archivo en Firebase Storage' })
    @ApiResponse({
        status: 200,
        description: 'URL firmada generada exitosamente',
        schema: {
            example: {
                signedUrl:
                    'https://storage.googleapis.com/reclutamiento-12537.appspot.com/cvs/22ebc082-a29c-4b9d-9749-e7c82eaeede2.pdf?GoogleAccessId=...&Expires=...&Signature=...',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Solicitud inválida o archivo no encontrado' })
    @ApiResponse({ status: 401, description: 'No autorizado (JWT inválido)' })
    @ApiResponse({ status: 403, description: 'Prohibido (rol no autorizado)' })
    async getSignedUrl(@Body() dto: GetSignedUrlDto, @Req() req: any) {
        try {
            const signedUrl = await this.storageService.getSignedUrlFromUrl(dto.url);
            return { signedUrl };
        } catch (error) {
            this.logger.error(`Error al generar URL firmada: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }
}