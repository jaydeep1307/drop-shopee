import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/\.(jpeg|jpg|png)$/, {
    message: "Image must be a valid image URL (jpeg, jpg, png)",
  })
  image: string;
}
