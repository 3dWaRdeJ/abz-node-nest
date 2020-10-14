import {Controller, Request, Post, UseGuards, Body, HttpCode, Req} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as AuthDto from './auth.dto';
import {UserEntity} from '../user/user.entity';
import {AuthService} from './auth.service';
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @HttpCode(200)
    @Post('/register')
    async register(@Body()registerDto: AuthDto.RegisterDto): Promise<UserEntity> {
        return this.authService.register(registerDto);
    }

    @HttpCode(200)
    @UseGuards(AuthGuard('local'))
    @Post('/login')
    async login(@Request() req, @Body()loginDto: AuthDto.LoginDto) {
        return this.authService.login(req.user);
    }

    @HttpCode(200)
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('/token')
    async token (@Request() req) {
        return this.authService.login(req.user);
    }
}