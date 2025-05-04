import { IsString, IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['superadmin', 'admin', 'user'])
  role: string;
}
