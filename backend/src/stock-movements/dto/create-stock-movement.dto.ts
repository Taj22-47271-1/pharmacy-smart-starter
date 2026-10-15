import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  medicineId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @IsEnum(MovementType, {
    message: 'Type must be one of: IN, OUT, ADJUSTMENT',
  })
  type: MovementType;

  @IsString()
  @IsOptional()
  note?: string;
}

