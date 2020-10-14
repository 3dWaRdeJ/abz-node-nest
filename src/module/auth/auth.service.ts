import {BadRequestException, ConflictException, Injectable} from '@nestjs/common';
import {UserService} from '../user/user.service';
import * as bcrypt from 'bcryptjs'
import * as AuthDto from './auth.dto';
import {UserEntity} from "../user/user.entity";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    public async getAuthenticatedUser(email: string, pass: string) {
        const user = await this.userService.findByEmail(email);
        if (user && bcrypt.compareSync(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: UserEntity) {
        const payload = {id: user.id};
        return {accessToken: this.jwtService.sign(payload)};
    }

    async register(regData: AuthDto.RegisterDto) {
        if (regData.password !== regData.password_confirm) {
            throw new BadRequestException('Wrong password confirm field, passwords don`t match')
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(regData.password, salt);
        try {
            return await this.userService.create({
                ...regData,
                password: hashedPass
            });
        } catch (err) {
            //mysql unique duplication code
            if (err?.errno === 1062) {
                throw new ConflictException('User with that email already exist');
            }
            throw err;
        }
    }
}