import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || !value.originalname) {
      throw new BadRequestException('File is required');
    }
    return value;
  }
}
