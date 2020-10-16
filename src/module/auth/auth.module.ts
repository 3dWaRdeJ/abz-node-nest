import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';
import {UserService} from "../user/user.service";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtStrategy} from "./strategy/jwt.strategy";

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigService,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? AuthModule.DEFAULT_JWT_KEY,
        signOptions: {expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? AuthModule.DEFAULT_JWT_EXPIRES_IN) + 's'}
      }),
      inject: [ConfigService]
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserService],
  controllers: [AuthController],
})
export class AuthModule {
    static DEFAULT_JWT_KEY = 'secret_app_key';
    static DEFAULT_JWT_EXPIRES_IN = '5m'
}
