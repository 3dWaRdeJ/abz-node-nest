import {ExtractJwt, Strategy} from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { AuthService } from '../auth.service';
import {ConfigService} from "@nestjs/config";
import {TokenPayload} from "../interface/tokenPayload.interface";
import {UserService} from "../../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
        private userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request) => {
                return request?.cookies?.Authentication;
            }]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')
        });
    }

    async validate(payload: TokenPayload) {
        const user = await this.userService.findOne(payload.userId);
        if (user) {
            delete user.password;
        }
        return user
    }
}