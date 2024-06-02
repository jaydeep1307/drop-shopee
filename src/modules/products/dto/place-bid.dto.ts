import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class PlaceBidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  bidAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  bidQuantity: number;
}
