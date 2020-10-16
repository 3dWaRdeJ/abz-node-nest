import {BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {UserService} from '../user/user.service';
import * as bcrypt from 'bcryptjs'
import * as AuthDto from './auth.dto';
import {UserEntity} from "../user/user.entity";
import {JwtService} from "@nestjs/jwt";
import {TokenPayload} from "./interface/tokenPayload.interface";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    public async getAuthenticatedUser(email: string, pass: string) {
        const user = await this.userService.findByEmail(email);
        if (!(user instanceof UserEntity)) {
            throw new NotFoundException(['user dont found']);
        }
        if (user && bcrypt.compareSync(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    public getCookieWithJwtToken(token: string) {
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    public getToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload);
        return token;
    }

    async register(regData: AuthDto.RegisterDto) {
        if (regData.password !== regData.password_confirm) {
            throw new BadRequestException(['Wrong password confirm field, passwords don`t match'])
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(regData.password, salt);
        try {
            return await this.userService.create({
                name: regData.name,
                email: regData.email,
                password: hashedPass
            });
        } catch (err) {
            //mysql unique duplication code
            if (err?.errno === 1062) {
                throw new ConflictException(['User with that email already exist']);
            }
            throw err;
        }
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }
}