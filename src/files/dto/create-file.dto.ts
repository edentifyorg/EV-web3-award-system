import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  size: number;

  @ApiProperty()
  @IsNotEmpty()
  private: boolean;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  orderItemId?: number | null | undefined;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  incomingInvoiceId?: number | null | undefined;
}
