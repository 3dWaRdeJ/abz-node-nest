import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EmployeeEntity} from "./employee.entity";
import {EmployeeService} from "./employee.service";
import { EmployeeController } from './employee.controller';
import {PositionEntity} from "../position/position.entity";
import {MulterModule} from "@nestjs/platform-express";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, PositionEntity])
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
