import { ApiProperty } from '@nestjs/swagger';
import { PermissionEnum } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsEnum(PermissionEnum, {
    each: true,
    message: 'Each value in permissions must be a valid enum value',
  })
  permissions?: PermissionEnum[];
}
