import { Test } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerImplementation } from 'src/logger/logger.interface';
import { ExposableExceptionHandlerFilter } from './exposable-exception-handler.filter';
import {
  extractRequestAndResponse,
  generateStandardLoggingParams,
} from '../exception-helpers';

jest.mock('../exception-helpers', () => ({
  extractRequestAndResponse: jest.fn(),
  generateStandardLoggingParams: jest.fn(),
}));

describe('ExposableExceptionHandlerFilter', () => {
  const mockLoggerImplementation = {
    logExposable: jest.fn(),
  };
  let exceptionFilter: ExposableExceptionHandlerFilter;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        ExposableExceptionHandlerFilter,
        {
          provide: LoggerImplementation,
          useValue: mockLoggerImplementation,
        },
      ],
    }).compile();

    exceptionFilter = testingModule.get<ExposableExceptionHandlerFilter>(
      ExposableExceptionHandlerFilter
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(exceptionFilter).toBeDefined();
  });

  describe('catch', () => {
    it('should properly extract request and response, generate log data, log error and respond to requester', () => {
      const mockArgumentsHost = 'mockArgumentsHost' as unknown as ArgumentsHost;

      const mockExceptionMessage = 'mockExceptionMessage';
      const mockStatusCode = HttpStatus.PRECONDITION_REQUIRED;
      const mockException = new HttpException(
        mockExceptionMessage,
        mockStatusCode
      );

      const mockReq = 'mockReq';
      const mockReqData = 'mockReqData';

      const mockResJson = jest.fn();
      const mockResStatus = jest.fn(() => ({
        json: mockResJson,
      }));
      const mockRes = {
        status: mockResStatus,
      };

      (extractRequestAndResponse as jest.Mock).mockImplementationOnce(() => ({
        req: mockReq,
        res: mockRes,
      }));
      (generateStandardLoggingParams as jest.Mock).mockImplementationOnce(
        () => ({
          reqData: mockReqData,
        })
      );

      exceptionFilter.catch(mockException, mockArgumentsHost);

      expect(extractRequestAndResponse).toHaveBeenCalledTimes(1);
      expect(extractRequestAndResponse).toHaveBeenCalledWith(mockArgumentsHost);

      expect(generateStandardLoggingParams).toHaveBeenCalledTimes(1);
      expect(generateStandardLoggingParams).toHaveBeenCalledWith(mockReq);

      expect(mockLoggerImplementation.logExposable).toHaveBeenCalledTimes(1);
      expect(mockLoggerImplementation.logExposable).toHaveBeenCalledWith(
        'HTTP ERROR',
        {
          reqData: mockReqData,
          cause: mockException,
        }
      );

      expect(mockResStatus).toHaveBeenCalledTimes(1);
      expect(mockResStatus).toHaveBeenCalledWith(mockStatusCode);

      expect(mockResJson).toHaveBeenCalledTimes(1);
      expect(mockResJson).toHaveBeenCalledWith({
        statusCode: mockStatusCode,
        message: mockExceptionMessage,
      });
    });
  });
});
