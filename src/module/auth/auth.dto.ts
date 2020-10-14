import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';
import {CreateDto} from "../user/user.dto";

export class LoginDto {
  @ApiProperty({required: true, format: "email"})
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({required: true, minLength: 8, maxLength: 255})
  @IsNotEmpty()
  @MaxLength(255)
  password: string;
}

export class RegisterDto extends CreateDto{
  @ApiProperty({required: true, minLength: 8, maxLength: 255})
  @IsNotEmpty()
  password_confirm: string;
}
