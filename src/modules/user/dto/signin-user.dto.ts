import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SigninUserDto {
  @ApiProperty({ example: 'jaydeep@yopmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jaydeep@123' })
  @IsNotEmpty()
  password: string;
}
