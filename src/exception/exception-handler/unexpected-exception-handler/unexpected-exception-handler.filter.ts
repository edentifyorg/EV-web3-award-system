import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Logger, LoggerImplementation } from 'src/logger/logger.interface';
import { LogData } from 'src/logger/log-data.interface';
import { internalServerError } from 'src/exception/exception-response/internal-server-error';
import {
  extractRequestAndResponse,
  generateStandardLoggingParams,
} from '../exception-helpers';

@Catch()
export class UnexpectedExceptionHandlerFilter implements ExceptionFilter {
  constructor(@Inject(LoggerImplementation) private logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    const { req, res } = extractRequestAndResponse(host);

    const logData: LogData = {
      ...generateStandardLoggingParams(req),
      cause: exception,
    };

    this.logger.logUnexposable('UNEXPECTED ERROR', logData);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(internalServerError);
  }
}
