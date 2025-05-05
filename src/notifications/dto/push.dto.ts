import { ApiProperty } from "@nestjs/swagger";
import { isDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PushDto {

    @ApiProperty({example: "", description: "Token FCM"})
    @IsString()
    @IsNotEmpty()
    token: string;
    
    @ApiProperty({example: "", description: "Titulo de notificación"})
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({example: "", description: "Texto de notificación"})
    @IsString()
    @IsNotEmpty()
    body: string;

    @IsOptional()
    data?: { [key: string]: string }; 
  }
  