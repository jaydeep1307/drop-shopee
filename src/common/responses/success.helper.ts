import { HttpStatus } from '@nestjs/common';

export function successResponse(
  message: string,
  data: any,
  status = HttpStatus.OK,
) {
  return { status, message, data };
}
