import { ApiProperty } from '@nestjs/swagger';
import { PermissionEnum } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionEnum, { each: true })
  permissions: PermissionEnum[];
}
