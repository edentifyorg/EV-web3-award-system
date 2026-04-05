import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UnexposableExceptionHandlerFilter } from './unexposable-exception-handler/unexposable-exception-handler.filter';
import { ExposableExceptionHandlerFilter } from './exposable-exception-handler/exposable-exception-handler.filter';
import { UnexpectedExceptionHandlerFilter } from './unexpected-exception-handler/unexpected-exception-handler.filter';

@Global()
@Module({
  providers: [
    { provide: APP_FILTER, useClass: UnexpectedExceptionHandlerFilter },
    { provide: APP_FILTER, useClass: ExposableExceptionHandlerFilter },
    { provide: APP_FILTER, useClass: UnexposableExceptionHandlerFilter },
  ],
})
export class ExceptionHandler {}
