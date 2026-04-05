import * as processorUtil from './baseFilterProcessorUtil';

describe('baseFilterProcessorUtil', () => {
  const mockField = 'mockField';
  const mockScalarValue = 'mockScalarValue';
  const mockVectorValue = ['mockVectorValue1', 'mockVectorValue2'];

  describe('handleEquals', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleEquals(mockField, mockScalarValue);
      expect(result).toEqual({
        [mockField]: mockScalarValue,
      });
    });

    it('should process input and return propper object when value is vector', () => {
      const result = processorUtil.handleEquals(mockField, mockVectorValue);
      expect(result).toEqual({
        [mockField]: { in: mockVectorValue },
      });
    });
  });

  describe('handleLike', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleLike(mockField, mockScalarValue);
      expect(result).toEqual({
        [mockField]: { contains: mockScalarValue },
      });
    });

    it('should process input and return propper object when value is vector', () => {
      const result = processorUtil.handleLike(mockField, mockVectorValue);
      expect(result).toEqual({
        OR: [
          { [mockField]: { contains: mockVectorValue[0] } },
          { [mockField]: { contains: mockVectorValue[1] } },
        ],
      });
    });
  });

  describe('handleLessThan', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleLessThan(mockField, mockScalarValue);
      expect(result).toEqual({
        [mockField]: { lt: mockScalarValue },
      });
    });
  });

  describe('handleGreaterThan', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleGreaterThan(
        mockField,
        mockScalarValue
      );
      expect(result).toEqual({
        [mockField]: { gt: mockScalarValue },
      });
    });
  });

  describe('handleLessThanOrEqual', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleLessThanOrEqual(
        mockField,
        mockScalarValue
      );
      expect(result).toEqual({
        [mockField]: { lte: mockScalarValue },
      });
    });
  });

  describe('handleGreaterThanOrEqual', () => {
    it('should process input and return propper object when value is scalar', () => {
      const result = processorUtil.handleGreaterThanOrEqual(
        mockField,
        mockScalarValue
      );
      expect(result).toEqual({
        [mockField]: { gte: mockScalarValue },
      });
    });
  });

  describe('handleBetweenInclusive', () => {
    it('should process input and return propper object when value is vector', () => {
      const result = processorUtil.handleBetweenInclusive(
        mockField,
        mockVectorValue
      );
      expect(result).toEqual({
        [mockField]: { gte: mockVectorValue[0], lte: mockVectorValue[1] },
      });
    });
  });

  describe('handleBetweenExclusive', () => {
    it('should process input and return propper object when value is vector', () => {
      const result = processorUtil.handleBetweenExclusive(
        mockField,
        mockVectorValue
      );
      expect(result).toEqual({
        [mockField]: { gt: mockVectorValue[0], lt: mockVectorValue[1] },
      });
    });
  });
});
