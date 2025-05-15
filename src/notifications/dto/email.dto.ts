import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EmailDto {
    @ApiProperty({ 
        example: "candidate@example.com", 
        description: "Email del destinatario" 
    })
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @ApiProperty({
        example: "Actualización de tu aplicación",
        description: "Asunto del email"
    })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({
        example: "Contenido en texto plano",
        description: "Versión en texto del mensaje",
        required: false
    })
    @IsString()
    @IsOptional()
    text?: string;

    @ApiProperty({
        example: "<h1>Contenido HTML</h1>",
        description: "Versión HTML del mensaje",
        required: false
    })
    @IsString()
    @IsOptional()
    html?: string;

    @ApiProperty({
        description: "Variables para la plantilla",
        required: false,
        type: Object
    })
    @IsOptional()
    templateData?: Record<string, any>;
}