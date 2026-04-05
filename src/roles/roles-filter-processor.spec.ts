import { Test, TestingModule } from '@nestjs/testing';
import { RoleFilterProcessor } from './roles-filter-processor';

describe('RoleFilterProcessor', () => {
  let testProcessor: RoleFilterProcessor;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [RoleFilterProcessor],
    }).compile();

    testProcessor = module.get<RoleFilterProcessor>(RoleFilterProcessor);
  });

  it('should be defined', () => {
    expect(testProcessor).toBeDefined();
  });

  it('should process specific filter and return empty array', () => {
    const result = testProcessor.processSpecificFilter({});
    expect(result).toEqual([]);
  });
});
