import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class CreateSlotsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  slotPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  slotUnits: number;
}
