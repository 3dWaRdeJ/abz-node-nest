import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EmployeeEntity} from "./employee.entity";
import {PositionEntity} from "../position/position.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, PositionEntity])
  ],
})
export class EmployeeModule {}
