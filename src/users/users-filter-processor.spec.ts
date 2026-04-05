import { Test, TestingModule } from '@nestjs/testing';
import { UserFilterProcessor } from './users-filter-processor';

describe('UserFilterProcessor', () => {
  let testProcessor: UserFilterProcessor;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [UserFilterProcessor],
    }).compile();

    testProcessor = module.get<UserFilterProcessor>(UserFilterProcessor);
  });

  it('should be defined', () => {
    expect(testProcessor).toBeDefined();
  });

  it('should process specific filter and return empty array', () => {
    const result = testProcessor.processSpecificFilter({});
    expect(result).toEqual([]);
  });
});
