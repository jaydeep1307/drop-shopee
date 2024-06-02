import { HttpException, HttpStatus } from '@nestjs/common';

export * from './auth.exception';
export * from './type.exception';

export const CustomError = {
  UnknownError(message: any, statusCode?: any): any {
    return new HttpException(
      {
        message: message || 'Something went wrong, please try again later!',
        error: 'UnknownError',
        statusCode: statusCode || HttpStatus.BAD_REQUEST,
      },
      statusCode || HttpStatus.BAD_REQUEST,
    );
  },
};
