import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PositionEntity} from "./position.entity";
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import {EmployeeEntity} from "../employee/employee.entity";
import {EmployeeService} from "../employee/employee.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PositionEntity, EmployeeEntity])
    ],
    controllers: [PositionController],
    providers: [PositionService, EmployeeService]
})
export class PositionModule {}
