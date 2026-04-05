import { LogData } from './log-data.interface';

export interface Logger {
  logUnexposable: (message: string, data: LogData) => void;
  logExposable: (message: string, data: LogData) => void;
}

export const LoggerImplementation = Symbol('LoggerImplementation');
