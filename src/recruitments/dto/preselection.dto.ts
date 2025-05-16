import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class PreselectionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    vacancyId: string;
  
    @ApiProperty()
    @IsInt()
    @Min(1)
    amount: number;
  }