import { FilterOperator } from 'src/enum/FilterOperator';
import { GeneralFilterValue } from 'src/types/filter-types';

export class RelatedFilterDto {
  [relatedModel: string]: {
    [field: string]: {
      value: GeneralFilterValue;
      operator: FilterOperator;
    };
  };
}
