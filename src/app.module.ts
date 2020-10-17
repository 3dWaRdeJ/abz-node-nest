import AdminBro from 'admin-bro';
import { Module } from '@nestjs/common';
import { Database, Resource } from '@admin-bro/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionModule } from './module/position/position.module';
import { PositionEntity } from "./module/position/position.entity";
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from './module/employee/employee.module';
import {EmployeeEntity} from "./module/employee/employee.entity";
import {UserEntity} from "./module/user/user.entity";
import { AdminBroModule } from './module/admin-bro/admin-bro.module';

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
      synchronize: env.DB_SYNC === 'true',
      logging: env.DB_LOGING === 'true'
    }),
    PositionModule,
    EmployeeModule,
    AdminBroModule
  ],
  providers: [Database],
})
export class AppModule {}
