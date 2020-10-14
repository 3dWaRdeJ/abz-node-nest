import AdminBro from 'admin-bro';
import { Module } from '@nestjs/common';
import { Database, Resource } from '@admin-bro/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PositionModule } from './module/position/position.module';
import { PositionEntity } from "./module/position/position.entity";
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from './module/employee/employee.module';
import {EmployeeEntity} from "./module/employee/employee.entity";
import {UserEntity} from "./module/user/user.entity";
import { AuthModule } from './module/auth/auth.module';
import {AdminModule} from "@admin-bro/nestjs";

const env = process.env;
AdminBro.registerAdapter({ Database, Resource })

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      // @ts-ignore
      type: env.DB_DIALECT,
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT),
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      entities: [
        PositionEntity,
        EmployeeEntity,
        UserEntity
      ],
      synchronize: env.DB_SYNC? Boolean(env.DB_SYNC) : false,
      // logging: env.DB_LOGING ? Boolean(env.DB_LOGING) : false
      logging: true
    }),
    // AdminModule.createAdmin({
    //   adminBroOptions: {
    //     rootPath: '/admin',
    //     resources: [
    //       {resource: UserEntity},
    //       {resource: PositionEntity},
    //       {resource: EmployeeEntity},
    //     ],
    //   }
    // }),
    PositionModule,
    EmployeeModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, Database],
})
export class AppModule {}
