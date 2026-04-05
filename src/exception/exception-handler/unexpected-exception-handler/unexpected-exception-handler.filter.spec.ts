import { Test } from '@nestjs/testing';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { LoggerImplementation } from 'src/logger/logger.interface';
import { internalServerError } from 'src/exception/exception-response/internal-server-error';
import {
  extractRequestAndResponse,
  generateStandardLoggingParams,
} from '../exception-helpers';
import { UnexpectedExceptionHandlerFilter } from './unexpected-exception-handler.filter';

jest.mock('../exception-helpers', () => ({
  extractRequestAndResponse: jest.fn(),
  generateStandardLoggingParams: jest.fn(),
}));

describe('UnexpectedExceptionHandlerFilter', () => {
  const mockLoggerImplementation = {
    logUnexposable: jest.fn(),
  };
  let exceptionFilter: UnexpectedExceptionHandlerFilter;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        UnexpectedExceptionHandlerFilter,
        {
          provide: LoggerImplementation,
          useValue: mockLoggerImplementation,
        },
      ],
    }).compile();

    exceptionFilter = testingModule.get<UnexpectedExceptionHandlerFilter>(
      UnexpectedExceptionHandlerFilter
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

      const mockException = 'mockException';

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

      expect(mockLoggerImplementation.logUnexposable).toHaveBeenCalledTimes(1);
      expect(mockLoggerImplementation.logUnexposable).toHaveBeenCalledWith(
        'UNEXPECTED ERROR',
        {
          reqData: mockReqData,
          cause: mockException,
        }
      );

      expect(mockResStatus).toHaveBeenCalledTimes(1);
      expect(mockResStatus).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR
      );

      expect(mockResJson).toHaveBeenCalledTimes(1);
      expect(mockResJson).toHaveBeenCalledWith(internalServerError);
    });
  });
});
