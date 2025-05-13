import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'CustomPasswordRules', async: false })
export class CustomPasswordValidator implements ValidatorConstraintInterface {
  validate(password: string, _args: ValidationArguments) {
    const lengthValid = password.length >= 8 && password.length <= 20;
    const uppercaseValid = /[A-Z]/.test(password);
    const numbers = password.match(/\d/g) || [];
    const numbersValid = numbers.length >= 1 && numbers.length <= 2;
    const specialChars = password.match(/[.@$#*]/g) || [];
    const specialCharsValid =
      specialChars.length >= 1 && specialChars.length <= 2;
    const onlyAllowedSpecials = /^[A-Za-z0-9.@$#*]*$/.test(password);

    return (
      lengthValid &&
      uppercaseValid &&
      numbersValid &&
      specialCharsValid &&
      onlyAllowedSpecials
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `La contraseña debe tener entre 8 y 20 caracteres, incluir 1-2 números, 1-2 caracteres especiales permitidos (., @, $, #, *), y al menos una letra mayúscula.`;
  }
}

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'MyPass@12',
    description: 'Nueva contraseña del usuario',
  })
  @IsString()
  @Length(8, 20)
  @Validate(CustomPasswordValidator)
  password: string;
}
