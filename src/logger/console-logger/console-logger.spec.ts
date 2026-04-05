import { Test, TestingModule } from '@nestjs/testing';
import { ErrorType } from 'src/enum/ErrorType';
import { LogData } from '../log-data.interface';
import { ConsoleLogger } from './console-logger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsoleLogger],
    }).compile();

    logger = module.get<ConsoleLogger>(ConsoleLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  describe('logUnexposable', () => {
    it('should log to console.error', () => {
      const mockConsoleError = jest
        .spyOn(console, 'error')
        .mockImplementationOnce(() => true);
      const mockMessage = 'mockMessage';
      const mockLogData = 'mockLogData' as unknown as LogData;

      logger.logUnexposable(mockMessage, mockLogData);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith({
        type: ErrorType.UNEXPOSABLE_ERROR,
        message: mockMessage,
        data: mockLogData,
      });
    });
  });

  describe('logExposable', () => {
    it('should log to console.error', () => {
      const mockConsoleError = jest
        .spyOn(console, 'error')
        .mockImplementationOnce(() => true);
      const mockMessage = 'mockMessage';
      const mockLogData = 'mockLogData' as unknown as LogData;

      logger.logExposable(mockMessage, mockLogData);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith({
        type: ErrorType.EXPOSABLE_ERROR,
        message: mockMessage,
        data: mockLogData,
      });
    });
  });
});
