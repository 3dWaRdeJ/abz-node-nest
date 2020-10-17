import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PositionEntity} from "../position/position.entity";
import {EmployeeEntity} from "../employee/employee.entity";
import {UserEntity} from "../user/user.entity";
import {UserResource} from './resources/user/user.resource';
import {AdminModule} from "@admin-bro/nestjs";
import * as bcrypt from 'bcryptjs';
import AdminBro from "admin-bro";
import {Database, Resource} from "@admin-bro/typeorm";
import {getRepository} from "typeorm";
import {PositionResource} from "./resources/position/position.resource";
import {EmployeeResource} from "./resources/employee/employee.resource";
import * as path from "path";

AdminBro.registerAdapter({ Database, Resource });

const resources = [
  UserResource,
  PositionResource,
  EmployeeResource
];



@Module({
  imports:[
    TypeOrmModule.forFeature([PositionEntity, EmployeeEntity, UserEntity]),
    AdminModule.createAdmin({
      adminBroOptions: {
        branding: {
          companyName: 'ABZ task node-nest-adminbro'
        },
        rootPath: '/admin',
        resources: resources,
        locale: {
          language: 'en',
          translations: {
            labels: {
              PositionEntity: 'Positions',
              EmployeeEntity: 'Employees',
              UserEntity: 'Admins'
            },
            resources: {
              UserEntity: {
                properties: {
                  virtualPassword: 'Password',
                  created_at: 'Created at',
                  updated_at: 'Updated at',
                }
              },
              PositionEntity: {
                properties: {
                  id: 'ID',
                  chief_position_id: 'Chief position',
                  admin_create_id: 'Admin created',
                  admin_update_id: 'Admin updated',
                  created_at: 'Created at',
                  updated_at: 'Updated at'
                }
              },
              EmployeeEntity: {
                properties: {
                  full_name: 'Name',
                  start_date: 'Date of employment',
                  chief_id: 'Chief',
                  phone: 'Phone number',
                  position_id: 'Position'
                }
              }
            }
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
