import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PositionEntity} from "../position/position.entity";
import {EmployeeEntity} from "../employee/employee.entity";
import {UserEntity} from "../user/user.entity";
import {UserLocaleResource, UserResource} from './resources/user/user.resource';
import {AdminModule} from "@admin-bro/nestjs";
import * as bcrypt from 'bcryptjs';
import AdminBro from "admin-bro";
import {Database, Resource} from "@admin-bro/typeorm";
import {getRepository} from "typeorm";
import {PositionLocaleResource, PositionResource} from "./resources/position/position.resource";
import {EmployeeLocaleResource, EmployeeResource} from "./resources/employee/employee.resource";

AdminBro.registerAdapter({ Database, Resource });

const resources = [
  UserResource,
  PositionResource,
  EmployeeResource
];

const localResources = {...EmployeeLocaleResource, ...PositionLocaleResource, ...UserLocaleResource}


@Module({
  imports:[
    TypeOrmModule.forFeature([PositionEntity, EmployeeEntity, UserEntity]),
    AdminModule.createAdmin({
      adminBroOptions: {
        branding: {
          companyName: 'ABZ task node-nest-adminbro'
        },
        rootPath: '/',
        loginPath: '/login',
        logoutPath: '/logout',
        resources: resources,
        locale: {
          language: 'en',
          translations: {
            labels: {
              PositionEntity: 'Positions',
              EmployeeEntity: 'Employees',
              UserEntity: 'Admins'
            },
            resources: localResources
          }
        },
      },
      auth: {
        authenticate: async (email, password) => {
          const userRepository = getRepository(UserEntity);
          const user = await userRepository.findOne({where: {email: email}});
          if (user) {
            const matched = bcrypt.compareSync(password, user.password);
            if (matched) {
              return user;
            }
          }
          return null;
        },
        cookiePassword: 'test',
        cookieName: 'Authenticate',
      },
      sessionOptions: {
        secret: process.env.ADMINBRO_SECRET,
        cookie: {
          maxAge: parseInt(process.env.ADMINBRO_SESSION_EXPIRES) ?? 60*5,
        },
      }
    }),
  ],
})
export class AdminBroModule {}
