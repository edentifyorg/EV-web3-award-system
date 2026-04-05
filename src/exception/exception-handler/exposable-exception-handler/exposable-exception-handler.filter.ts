import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { LogData } from 'src/logger/log-data.interface';
import { Logger, LoggerImplementation } from 'src/logger/logger.interface';
import {
  extractRequestAndResponse,
  generateStandardLoggingParams,
} from '../exception-helpers';

@Catch(HttpException)
export class ExposableExceptionHandlerFilter implements ExceptionFilter {
  constructor(@Inject(LoggerImplementation) private logger: Logger) {}

  public catch(exception: HttpException, host: ArgumentsHost) {
    const { req, res } = extractRequestAndResponse(host);

    const logData: LogData = {
      ...generateStandardLoggingParams(req),
      cause: exception,
    };

    this.logger.logExposable('HTTP ERROR', logData);

    res.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.getResponse(),
    });
  }
}
