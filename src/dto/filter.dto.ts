import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { GeneralFilterDto } from './general-filter.dto';
import { RelatedFilterDto } from './related-filter.dto';

export class FilterDto {
  @ApiProperty()
  @IsOptional()
  general?: GeneralFilterDto;

  @ApiProperty()
  @IsOptional()
  specific?: any;

  @ApiProperty()
  @IsOptional()
  related?: RelatedFilterDto;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  skip?: number;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  take?: number;

  @ApiProperty()
  @IsOptional()
  orderBy?: {
    [key: string]: string;
  };

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  include?: string[];
}
