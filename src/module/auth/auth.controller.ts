import {Controller, Request, Post, UseGuards, Body, HttpCode, Res, Get, Render, Req, UseFilters} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as AuthDto from './auth.dto';
import {UserEntity} from '../user/user.entity';
import {AuthService} from './auth.service';
import { ApiCookieAuth, ApiTags} from "@nestjs/swagger";
import RequestWithUser from "./interface/requestWithUser.interface";
import {AllExceptionFilter} from "../../all-exception.filter";

@ApiTags('Auth')
@UseFilters(new AllExceptionFilter)
@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Get('/login')
    @Render('auth/login')
    async loginPage(@Req() req) {
        // return {csrfToken: req.csrfToken()};
        return {};
    }

    @Get('/register')
    @Render('auth/register')
    async  registerPage(@Req() req) {
        // return {csrfToken: req.csrfToken()};
        return {};
    }

    @UseFilters(new AllExceptionFilter())
    @HttpCode(200)
    @Post('/api/v1/register')
    async register(@Body()registerDto: AuthDto.RegisterDto): Promise<UserEntity> {
        return this.authService.register(registerDto);
    }

    @UseFilters(new AllExceptionFilter())
    @HttpCode(200)
    @UseGuards(AuthGuard('local'))
    @Post('/api/v1/login')
    async login(@Body() body: AuthDto.LoginDto,@Req() request: RequestWithUser, @Res() response) {
        const {user} = request;
        const token = this.authService.getToken(user.id);
        const cookie = this.authService.getCookieWithJwtToken(token);
        response.setHeader('Set-Cookie', cookie);
        return response.send(user);
    }

    @HttpCode(200)
    @ApiCookieAuth('Authentication')
    @UseGuards(AuthGuard('jwt'))
    @Post('/api/v1/token')
    async token (@Request() request: RequestWithUser, @Res() response) {
        const {user} = request;
        const token = this.authService.getToken(user.id);
        const cookie = this.authService.getCookieWithJwtToken(token);
        response.setHeader('Set-Cookie', cookie);
        return response.send({token: token});
    }

    @HttpCode(200)
    @ApiCookieAuth('Authentication')
    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    async logOut(@Req() request: RequestWithUser, @Res() response) {
        response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
        response.redirect(303, '/login');
        return response.sendStatus(303);
    }
}