import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PositionEntity} from "./position.entity";
import {EmployeeEntity} from "../employee/employee.entity";

@Module({
    imports: [
      TypeOrmModule.forFeature([PositionEntity, EmployeeEntity])],
})
export class PositionModule {}
