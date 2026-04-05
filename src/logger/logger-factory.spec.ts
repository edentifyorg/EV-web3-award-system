import { ConfigService } from '@nestjs/config';
import { LogDestination } from 'src/enum/LogDestination';
import { loggerImplementationFactory } from './logger-factory';
import { BugsnagLogger } from './bugsnag-logger/bugsnag-logger';
import { ConsoleLogger } from './console-logger/console-logger';

jest.mock('./bugsnag-logger/bugsnag-logger', () => ({
  BugsnagLogger: jest.fn(),
}));
jest.mock('./console-logger/console-logger', () => ({
  ConsoleLogger: jest.fn(),
}));

describe('loggerImplementationFactory', () => {
  let mockConfigService: ConfigService;
  beforeEach(() => {
    mockConfigService = {
      getOrThrow: jest.fn(),
    } as unknown as ConfigService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return instance of ConsoleLogger', () => {
    (mockConfigService.getOrThrow as jest.Mock).mockReturnValueOnce(
      LogDestination.CONSOLE
    );

    const result = loggerImplementationFactory(mockConfigService);

    expect(result).toBeInstanceOf(ConsoleLogger);
  });

  it('should return an instance of BugsnagLogger', () => {
    (mockConfigService.getOrThrow as jest.Mock).mockReturnValueOnce(
      LogDestination.BUGSNAG
    );

    const result = loggerImplementationFactory(mockConfigService);

    expect(BugsnagLogger).toHaveBeenCalledWith(mockConfigService);
    expect(result).toBeInstanceOf(BugsnagLogger);
  });

  it('shoult throw "Unknown log destination" error if log destination is unknown', () => {
    (mockConfigService.getOrThrow as jest.Mock).mockReturnValueOnce(
      'UNKNOWN DESTINATION'
    );

    expect(() => loggerImplementationFactory(mockConfigService)).toThrowError(
      new Error('Unknown log destination')
    );
  });
});
