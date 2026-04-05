import { Test, TestingModule } from '@nestjs/testing';
import { GeneralFilterDto } from 'src/dto/general-filter.dto';
import { RelatedFilterDto } from 'src/dto/related-filter.dto';
import { FilterOperator } from 'src/enum/FilterOperator';
import { FilterDto } from 'src/dto/filter.dto';
import { BaseFilterProcessor } from './base-filter-processor';
import * as handleCases from './baseFilterProcessorUtil';

jest.mock('./baseFilterProcessorUtil');

const mockProcessor = {
  [FilterOperator.EQ]: handleCases.handleEquals,
  [FilterOperator.LK]: handleCases.handleLike,
  [FilterOperator.LT]: handleCases.handleLessThan,
  [FilterOperator.GT]: handleCases.handleGreaterThan,
  [FilterOperator.LTE]: handleCases.handleLessThanOrEqual,
  [FilterOperator.GTE]: handleCases.handleGreaterThanOrEqual,
  [FilterOperator.BTIN]: handleCases.handleBetweenInclusive,
  [FilterOperator.BTEX]: handleCases.handleBetweenExclusive,
};

class FilterProcessorImplementation extends BaseFilterProcessor {
  public processSpecificFilter(specificFilter: any) {
    return specificFilter;
  }
}

describe('BaseFilterProcessor', () => {
  let processor: BaseFilterProcessor;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [FilterProcessorImplementation],
    }).compile();

    processor = module.get<FilterProcessorImplementation>(
      FilterProcessorImplementation
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('BaseFilterProcessor', () => {
    it('should be defined', () => {
      expect(processor).toBeDefined();
    });

    describe('processGeneralFilter', () => {
      it.each(
        Object.keys(FilterOperator).map(operator => ({
          field: {
            value: 'valueMock',
            operator,
          },
        }))
      )('should properly call the handle function for input %o', value => {
        processor.processGeneralFilter(value as GeneralFilterDto);
        expect(
          mockProcessor[value.field.operator as FilterOperator]
        ).toHaveBeenCalled();
      });

      it('should properly generate output object', () => {
        const mockGeneralFilterInput = {
          field: { value: 1, operator: FilterOperator.EQ },
        };
        const mockReturn = 'mockReturn';

        (mockProcessor[FilterOperator.EQ] as jest.Mock).mockReturnValueOnce(
          mockReturn
        );

        const result = processor.processGeneralFilter(mockGeneralFilterInput);

        expect(result).toEqual([mockReturn]);
      });
    });

    describe('processRelatedFilter', () => {
      it('should process a single related filter', () => {
        const mockRelatedFilterInput = {
          relatedModel: {
            field: { value: 'relatedValue', operator: FilterOperator.EQ },
          },
        };

        const mockReturn = { relatedModelField: 'processedValue' };
        (mockProcessor[FilterOperator.EQ] as jest.Mock).mockReturnValue(
          mockReturn
        );

        const result = processor.processRelatedFilter(
          mockRelatedFilterInput as unknown as RelatedFilterDto
        );

        expect(mockProcessor[FilterOperator.EQ]).toHaveBeenCalledWith(
          'field',
          'relatedValue'
        );
        expect(result).toEqual([{ relatedModel: mockReturn }]);
      });

      it('should process multiple related filters for the same model', () => {
        const mockRelatedFilterInput = {
          relatedModel: {
            field1: { value: 'value1', operator: FilterOperator.EQ },
            field2: { value: 'value2', operator: FilterOperator.LT },
          },
        };

        const mockReturn1 = { field1: 'processedValue1' };
        const mockReturn2 = { field2: 'processedValue2' };
        (mockProcessor[FilterOperator.EQ] as jest.Mock).mockReturnValue(
          mockReturn1
        );
        (mockProcessor[FilterOperator.LT] as jest.Mock).mockReturnValue(
          mockReturn2
        );

        const result = processor.processRelatedFilter(
          mockRelatedFilterInput as unknown as RelatedFilterDto
        );

        expect(mockProcessor[FilterOperator.EQ]).toHaveBeenCalledWith(
          'field1',
          'value1'
        );
        expect(mockProcessor[FilterOperator.LT]).toHaveBeenCalledWith(
          'field2',
          'value2'
        );
        expect(result).toEqual([
          { relatedModel: { ...mockReturn1, ...mockReturn2 } },
        ]);
      });

      it('should process related filters for multiple models', () => {
        const mockRelatedFilterInput = {
          relatedModel1: {
            field: { value: 'value1', operator: FilterOperator.EQ },
          },
          relatedModel2: {
            field: { value: 'value2', operator: FilterOperator.LT },
          },
        };

        const mockReturn1 = { relatedModel1Field: 'processedValue1' };
        const mockReturn2 = { relatedModel2Field: 'processedValue2' };
        (mockProcessor[FilterOperator.EQ] as jest.Mock).mockReturnValue(
          mockReturn1
        );
        (mockProcessor[FilterOperator.LT] as jest.Mock).mockReturnValue(
          mockReturn2
        );

        const result = processor.processRelatedFilter(
          mockRelatedFilterInput as unknown as RelatedFilterDto
        );

        expect(mockProcessor[FilterOperator.EQ]).toHaveBeenCalledWith(
          'field',
          'value1'
        );
        expect(mockProcessor[FilterOperator.LT]).toHaveBeenCalledWith(
          'field',
          'value2'
        );
        expect(result).toEqual([
          { relatedModel1: mockReturn1 },
          { relatedModel2: mockReturn2 },
        ]);
      });

      it('should handle empty related filters', () => {
        const mockRelatedFilterInput = {};

        const result = processor.processRelatedFilter(
          mockRelatedFilterInput as unknown as RelatedFilterDto
        );

        expect(result).toEqual([]);
        expect(mockProcessor[FilterOperator.EQ]).not.toHaveBeenCalled();
      });
    });
  });

  describe('generateQuery', () => {
    it('should properly generate full query object based on input', () => {
      const mockFilterInput = {
        general: 'mockGeneralFilter',
        related: 'mockRelatedFilter',
        specific: 'mockSpecificFilter',
        skip: 'mockSkip',
        take: 'mockTake',
        orderBy: 'mockOrderBy',
        include: 'mockInclude',
      };

      (processor.processGeneralFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processRelatedFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processSpecificFilter as jest.Mock) = jest.fn(arg => [arg]);

      const result = processor.generateQuery(
        mockFilterInput as unknown as FilterDto
      );

      expect(processor.processGeneralFilter).toHaveBeenCalledTimes(1);
      expect(processor.processGeneralFilter).toHaveBeenCalledWith(
        mockFilterInput.general
      );

      expect(processor.processRelatedFilter).toHaveBeenCalledTimes(1);
      expect(processor.processRelatedFilter).toHaveBeenCalledWith(
        mockFilterInput.related
      );

      expect(processor.processSpecificFilter).toHaveBeenCalledTimes(1);
      expect(processor.processSpecificFilter).toHaveBeenCalledWith(
        mockFilterInput.specific
      );

      expect(result.where).toEqual({
        AND: [
          mockFilterInput.general,
          mockFilterInput.related,
          mockFilterInput.specific,
        ],
      });

      expect(result.skip).toEqual(mockFilterInput.skip);
      expect(result.take).toEqual(mockFilterInput.take);
    });

    it('should exclude general and related filter from generated where query object if general and related filters are not supplied', () => {
      const mockFilterInput = {
        specific: 'mockSpecificFilter',
      };

      (processor.processGeneralFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processRelatedFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processSpecificFilter as jest.Mock) = jest.fn(arg => [arg]);

      const result = processor.generateQuery(
        mockFilterInput as unknown as FilterDto
      );

      expect(processor.processGeneralFilter).not.toHaveBeenCalled();
      expect(processor.processRelatedFilter).not.toHaveBeenCalled();
      expect(processor.processSpecificFilter).toHaveBeenCalledTimes(1);
      expect(processor.processSpecificFilter).toHaveBeenCalledWith(
        mockFilterInput.specific
      );

      expect(result.where).toEqual({ AND: [mockFilterInput.specific] });
    });

    it('should exclude general and specific filter from generated where query object if general and specific filters are not supplied', () => {
      const mockFilterInput = {
        general: 'mockGeneralFilter',
      };

      (processor.processGeneralFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processRelatedFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processSpecificFilter as jest.Mock) = jest.fn(arg => [arg]);

      const result = processor.generateQuery(
        mockFilterInput as unknown as FilterDto
      );

      expect(processor.processRelatedFilter).not.toHaveBeenCalled();
      expect(processor.processSpecificFilter).not.toHaveBeenCalled();
      expect(processor.processGeneralFilter).toHaveBeenCalledTimes(1);
      expect(processor.processGeneralFilter).toHaveBeenCalledWith(
        mockFilterInput.general
      );

      expect(result.where).toEqual({ AND: [mockFilterInput.general] });
    });

    it('should exclude general and specific and related filter from generated where query object if general and specific filters not supplied', () => {
      const mockFilterInput = {
        related: 'mockRelatedFilter',
      };

      (processor.processGeneralFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processRelatedFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processSpecificFilter as jest.Mock) = jest.fn(arg => [arg]);

      const result = processor.generateQuery(
        mockFilterInput as unknown as FilterDto
      );

      expect(processor.processGeneralFilter).not.toHaveBeenCalled();
      expect(processor.processSpecificFilter).not.toHaveBeenCalled();
      expect(processor.processRelatedFilter).toHaveBeenCalledTimes(1);
      expect(processor.processRelatedFilter).toHaveBeenCalledWith(
        mockFilterInput.related
      );

      expect(result.where).toEqual({ AND: [mockFilterInput.related] });
    });

    it('should skip generating where query object if both general and specific filters are not supplied', () => {
      const mockFilterInput = {};

      (processor.processGeneralFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processRelatedFilter as jest.Mock) = jest.fn(arg => [arg]);
      (processor.processSpecificFilter as jest.Mock) = jest.fn(arg => [arg]);

      const result = processor.generateQuery(
        mockFilterInput as unknown as FilterDto
      );

      expect(processor.processGeneralFilter).not.toHaveBeenCalled();
      expect(processor.processRelatedFilter).not.toHaveBeenCalled();
      expect(processor.processSpecificFilter).not.toHaveBeenCalled();

      expect(result.where).not.toBeDefined();
    });
  });
});
