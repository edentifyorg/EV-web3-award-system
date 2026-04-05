import { HttpStatus } from '@nestjs/common';

export const internalServerError = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  message: 'Internal server error',
};
