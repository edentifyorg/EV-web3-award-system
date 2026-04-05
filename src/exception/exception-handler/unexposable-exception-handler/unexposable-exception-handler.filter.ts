import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Injectable,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { Logger, LoggerImplementation } from 'src/logger/logger.interface';
import { LogData } from 'src/logger/log-data.interface';
import { UnexposableException } from 'src/exception/custom-exception';
import { internalServerError } from 'src/exception/exception-response/internal-server-error';
import {
  extractRequestAndResponse,
  generateStandardLoggingParams,
} from '../exception-helpers';

@Catch(UnexposableException)
@Injectable()
export class UnexposableExceptionHandlerFilter implements ExceptionFilter {
  constructor(@Inject(LoggerImplementation) private logger: Logger) {}

  public catch(exception: UnexposableException, host: ArgumentsHost) {
    const { req, res } = extractRequestAndResponse(host);

    const logData: LogData = {
      ...generateStandardLoggingParams(req),
      cause: exception.getCause(),
      stack: exception.stack,
    };

    this.logger.logUnexposable('UNEXPOSABLE ERROR', logData);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(internalServerError);
  }
}
