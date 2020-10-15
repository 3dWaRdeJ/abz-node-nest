import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {EmployeeEntity} from "./employee.entity";
import {EmployeeService} from "./employee.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity])
  ],
  providers: [EmployeeService]
})
export class EmployeeModule {}
