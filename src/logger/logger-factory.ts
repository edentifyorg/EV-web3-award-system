import { ConfigService } from '@nestjs/config';
import { LogDestination } from 'src/enum/LogDestination';
import { EnvironmentVariableKey } from 'src/enum/EnvironmentVariableKey';
import { Logger } from './logger.interface';
import { BugsnagLogger } from './bugsnag-logger/bugsnag-logger';
import { ConsoleLogger } from './console-logger/console-logger';

export function loggerImplementationFactory(config: ConfigService): Logger {
  const logDestination = config.getOrThrow<LogDestination>(
    EnvironmentVariableKey.LOG_DESTINATION
  );

  switch (logDestination) {
    case LogDestination.CONSOLE:
      return new ConsoleLogger();
    case LogDestination.BUGSNAG:
      return new BugsnagLogger(config);
    default:
      throw new Error('Unknown log destination');
  }
}
