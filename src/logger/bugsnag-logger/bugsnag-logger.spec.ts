import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Bugsnag from '@bugsnag/js';
import { LogData } from '../log-data.interface';
import { BugsnagLogger } from './bugsnag-logger';

jest.mock('@bugsnag/js');

describe('BugsnagLogger', () => {
  let provider: BugsnagLogger;
  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BugsnagLogger,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<BugsnagLogger>(BugsnagLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('logUnexposable', () => {
    it('should properly log unexposable', () => {
      const mockMessage = 'mockMessage';
      const mockLogData = {
        cause: 'mockCause',
      } as unknown as LogData;

      provider.logUnexposable(mockMessage, mockLogData);

      expect(Bugsnag.notify).toHaveBeenCalledTimes(1);
    });
  });

  describe('logExposable', () => {
    it('should properly log unexposable', () => {
      const mockMessage = 'mockMessage';
      const mockLogData = {
        cause: 'mockCause',
      } as unknown as LogData;

      provider.logUnexposable(mockMessage, mockLogData);

      expect(Bugsnag.notify).toHaveBeenCalledTimes(1);
    });
  });
});
