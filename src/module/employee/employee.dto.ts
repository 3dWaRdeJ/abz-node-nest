import {
  IsDateString, IsEmail,
  IsInt, IsNumber, IsOptional, IsPhoneNumber, Length,
  Max,
  Min,
} from 'class-validator'
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {EmployeeEntity} from "./employee.entity";

export class CreateDto {
  @ApiProperty()
  @Length(3,255)
  full_name: string;

  @ApiProperty({type: "float"})
  @IsNumber()
  @Min(0)
  @Max(EmployeeEntity.MAX_SALARY)
  salary: number;

  @ApiProperty({format: "date"})
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsPhoneNumber('ua')
  phone: string;

  @ApiProperty({format: 'email'})
  @IsEmail()
  email: string;

  // photo: string;

  @ApiPropertyOptional({type: 'integer'})
  @IsOptional()
  @IsInt()
  @Min(1)
  chief_id: number;

  @ApiProperty({type: 'integer'})
  @IsInt()
  @Min(1)
  position_id: number;
}

