import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, isEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EmailDto {
    @ApiProperty({example: "example@example.com", description: "Email de remitente"})
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @ApiProperty({example: "", description: "Subjecto del email"})
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({example: "", description: "Texto del mensaje"})
    @IsString()
    @IsOptional()
    text?: string;

    @IsOptional()
    html?: string;
  }
  