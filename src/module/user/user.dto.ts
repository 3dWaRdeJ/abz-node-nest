import {
    IsEmail,
    IsNotEmpty,
    Length,
} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';

export class CreateDto {
    @ApiProperty({required: true, minLength: 3, maxLength: 255})
    @IsNotEmpty()
    @Length(3, 255)
    name: string;

    @ApiProperty({required: true, format: "email"})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({required: true, minLength: 8, maxLength: 255})
    @IsNotEmpty()
    @Length(8, 255)
    password: string;
}
