import { FilterOperator } from 'src/enum/FilterOperator';
import { GeneralFilterValue } from 'src/types/filter-types';
import { GeneralFilterDto } from 'src/dto/general-filter.dto';
import { RelatedFilterDto } from 'src/dto/related-filter.dto';
import { FilterDto } from 'src/dto/filter.dto';
import {
  handleBetweenExclusive,
  handleBetweenInclusive,
  handleEquals,
  handleGreaterThan,
  handleGreaterThanOrEqual,
  handleLessThan,
  handleLessThanOrEqual,
  handleLike,
} from './baseFilterProcessorUtil';

// TODO - We have a lot of 'any' types here. Try to avoid and
// have everything neatly typed. Deal with this in the future.
export abstract class BaseFilterProcessor {
  private readonly generalProcessor: {
    [key in FilterOperator]: (field: any, value: GeneralFilterValue) => any;
  };

  constructor() {
    this.generalProcessor = {
      [FilterOperator.EQ]: handleEquals,
      [FilterOperator.LK]: handleLike,
      [FilterOperator.LT]: handleLessThan,
      [FilterOperator.GT]: handleGreaterThan,
      [FilterOperator.LTE]: handleLessThanOrEqual,
      [FilterOperator.GTE]: handleGreaterThanOrEqual,
      [FilterOperator.BTIN]: handleBetweenInclusive,
      [FilterOperator.BTEX]: handleBetweenExclusive,
    };
  }

  public abstract processSpecificFilter(specificFilter: any): any;

  public processGeneralFilter(generalFilter: GeneralFilterDto) {
    return Object.keys(generalFilter).map(field => {
      const { operator, value } = generalFilter[field];
      return this.generalProcessor[operator](field, value);
    });
  }

  public processRelatedFilter(relatedFilter: RelatedFilterDto) {
    const related = relatedFilter as RelatedFilterDto;

    const processedFilters: any[] = [];

    for (const [relatedModel, value] of Object.entries(related)) {
      const relatedFilters: any = {};

      for (const [field, filter] of Object.entries(value)) {
        const { operator, value: relatedModelValue } = filter;

        const processedFilter = this.generalProcessor[operator](
          field,
          relatedModelValue
        );

        relatedFilters[relatedModel] = {
          ...relatedFilters[relatedModel],
          ...processedFilter,
        };
      }

      processedFilters.push(relatedFilters);
    }
    return processedFilters;
  }

  public generateQuery(filter: FilterDto): any {
    const query: any = {};
    if (filter.general || filter.specific || filter.related) {
      let andArray: any = [];
      if (filter.general) {
        andArray = andArray.concat(this.processGeneralFilter(filter.general));
      }
      if (filter.related) {
        andArray = andArray.concat(this.processRelatedFilter(filter.related));
      }
      if (filter.specific) {
        andArray = andArray.concat(this.processSpecificFilter(filter.specific));
      }
      query.where = {
        AND: andArray,
      };
    }
    if (filter.skip) {
      query.skip = filter.skip;
    }
    if (filter.take) {
      query.take = filter.take;
    }
    if (filter.orderBy) {
      query.orderBy = filter.orderBy;
    }
    if (filter.include) {
      query.include = filter.include;
    }

    return query;
  }
}
