import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilterOperator } from 'src/enum/FilterOperator';
import { GeneralFilterValue } from 'src/types/filter-types';

export class GeneralFilterField {
  @ApiProperty()
  @IsNotEmpty()
  value: GeneralFilterValue;

  @ApiProperty()
  @IsEnum(FilterOperator)
  operator: FilterOperator;
}

export class GeneralFilterDto {
  [key: string]: GeneralFilterField;
}
