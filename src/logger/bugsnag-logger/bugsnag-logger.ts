import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Bugsnag from '@bugsnag/js';
import { ErrorType } from 'src/enum/ErrorType';
import { EnvironmentVariableKey } from 'src/enum/EnvironmentVariableKey';
import { Logger } from '../logger.interface';
import { LogData } from '../log-data.interface';

@Injectable()
export class BugsnagLogger implements Logger {
  constructor(private config: ConfigService) {
    Bugsnag.start({
      apiKey: this.config.getOrThrow<string>(
        EnvironmentVariableKey.BUGSNAG_API_KEY
      ),
    });
  }

  public logUnexposable(message: string, data: LogData) {
    this.notify(ErrorType.UNEXPOSABLE_ERROR, message, data);
  }

  public logExposable(message: string, data: LogData) {
    this.notify(ErrorType.EXPOSABLE_ERROR, message, data);
  }

  public notify(errorType: ErrorType, message: string, data: LogData) {
    Bugsnag.notify(data.cause, event => {
      event.addMetadata('errorMeta', {
        errorType,
        message,
      });
      event.addMetadata('requestData', {
        method: data.requestMethod,
        path: data.requestPath,
        url: data.requestUrl,
        body: data.requestBody,
        params: data.requestParams,
        query: data.requestQuery,
      });
      event.addMetadata('stack', {
        stack: data.stack,
      });
    });
  }
}
