import {
  IsInt, IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {PositionEntity} from "./position.entity";

export class CreateDto {
  @ApiProperty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({required: true, type: "integer"})
  @IsOptional()
  @IsInt()
  chief_position_id: number;

  @ApiPropertyOptional({type:"integer"})
  @IsOptional()
  @Min(1)
  @Max(PositionEntity.MAX_LEVEL)
  level?: number
}

