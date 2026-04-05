import { Injectable } from '@nestjs/common';
import { ErrorType } from 'src/enum/ErrorType';
import { Logger } from '../logger.interface';
import { LogData } from '../log-data.interface';

@Injectable()
export class ConsoleLogger implements Logger {
  public logUnexposable(message: string, data: LogData) {
    console.error({
      type: ErrorType.UNEXPOSABLE_ERROR,
      message,
      data,
    });
  }

  public logExposable(message: string, data: LogData) {
    console.error({
      type: ErrorType.EXPOSABLE_ERROR,
      message,
      data,
    });
  }
}
