import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class PayloadlDto {
    @ApiProperty()
    @IsNotEmpty()
    message: string;

  }
  