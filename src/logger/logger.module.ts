import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerImplementation } from './logger.interface';
import { loggerImplementationFactory } from './logger-factory';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LoggerImplementation,
      useFactory: loggerImplementationFactory,
      inject: [ConfigService],
    },
  ],
  exports: [LoggerImplementation],
})
export class LoggerModule {}
