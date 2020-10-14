import {
  IsNotEmpty, IsOptional, Max,
  MaxLength, Min,
} from 'class-validator'
import {ApiProperty, ApiQuery} from '@nestjs/swagger';
import {PositionEntity} from "./position.entity";

export class CreateDto {
  @ApiProperty({required: true})
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @ApiProperty({required: true, type: "integer"})
  chief_position_id: number;

  @IsOptional()
  @ApiProperty({required: false, type:"integer"})
  @Min(1)
  @Max(PositionEntity.MAX_LEVEL)
  level?: number
}

