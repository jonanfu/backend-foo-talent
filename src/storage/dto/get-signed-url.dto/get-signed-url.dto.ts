import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSignedUrlDto {
    @ApiProperty({
        description: 'URL del archivo en Firebase Storage (formato gs:// o HTTPS)',
        example: 'gs://reclutamiento-12537.firebasestorage.app/cvs/22ebc082-a29c-4b9d-9749-e7c82eaeede2.pdf',
    })
    @IsString()
    url: string;

    @ApiProperty({
        description: 'Token de acceso (opcional, no requerido para URLs firmadas)',
        example: 'ff86bc7e-9fab-4635-a33c-976ee3070118',
        required: false,
    })
    @IsString()
    @IsOptional()
    token?: string;
}