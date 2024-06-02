import { HttpException, HttpStatus } from '@nestjs/common';

export const TypeExceptions = {
  UserNotFound(): any {
    return new HttpException(
      {
        message: 'User not found',
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  },

  UserAlreadyExists(): any {
    return new HttpException(
      {
        message: 'User already exists',
        error: 'UserAlreadyExists',
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT,
    );
  },

  SomethingWentWrong(): any {
    return new HttpException(
      {
        message: 'Something went wrong please try again.',
        error: 'unown error',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  },

  /*Common error msg throw function*/

  NotFoundCommMsg(msg) {
    return new HttpException(
      {
        message: msg,
        error: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND,
    );
  },

  InvalidLogin(msg) {
    return new HttpException(
      {
        message: msg,
        error: 'Invalid email or password.',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  },

  BadReqCommMsg(msg) {
    return new HttpException(
      {
        message: msg,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  },
};
