import { HttpStatus } from '@nestjs/common';

export function errorResponse(
  message: string,
  status = HttpStatus.BAD_REQUEST,
) {
  return { status, message };
}
