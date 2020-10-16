import {
  IsInt, IsObject, IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {PositionEntity} from "./position.entity";
import {ParseIntPipe} from "@nestjs/common";

class Search {
  value: string;
  regex: 'false' | 'true';
}
class Column {
  data: string;
  name: string;
  serchable: 'true' | 'false';
  orderable: 'true' | 'false';
  search: Search
}

class Order {
  column: string; //column index in 'columns'
  dir: 'desc' | 'asc';
}
export class GetRequestDto {
  draw: string;
  columns: Column[];
  order: Order[];
  start: string;//int
  length: string;//int
  search: Search;
}

export class GetResponseDto {
  draw: number;

  recordsTotal: number;

  recordsFiltered: number;

  data: PositionEntity[];

  error?: string;
}

export class CreateDto {
  @ApiProperty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ type: "integer"})
  @IsOptional()
  @IsInt()
  @Min(1)
  chief_position_id: number;

  @ApiPropertyOptional({type:"integer"})
  @IsOptional()
  @Min(1)
  @Max(PositionEntity.MAX_LEVEL)
  level?: number
}

