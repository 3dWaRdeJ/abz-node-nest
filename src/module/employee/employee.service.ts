import {ConflictException, Injectable, NotFoundException, Type, UnprocessableEntityException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindManyOptions, FindOneOptions, Repository} from 'typeorm';
import {EmployeeEntity} from "./employee.entity";
import {PositionEntity} from "../position/position.entity";
import {PositionService} from "../position/position.service";
import {EntityNotFoundError} from "typeorm/error/EntityNotFoundError";
import {isNumber} from "util";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>
  ) {
  }

  async find(findOptions?: FindManyOptions): Promise<EmployeeEntity[]> {
    return this.employeeRepository.find(findOptions);
  }

  async findById(id: number, findOptions?: FindOneOptions): Promise<EmployeeEntity> {
    return this.employeeRepository.findOne(id, findOptions);
  }
  
  async findByIdOrFail(id: number, findOptions?: FindOneOptions): Promise<EmployeeEntity> {
    return this.employeeRepository.findOneOrFail(id, findOptions)
  }

  async save(employee): Promise<EmployeeEntity> {
    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }

  async checkIfExist(id: number, findOptions?: FindOneOptions): Promise<EmployeeEntity> {
    try {
      return await this.findByIdOrFail(id, findOptions);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new UnprocessableEntityException(`Employee with id=${id} not found`)
      }
      throw err;
    }
  }

  async checkIfPositionExist(id: number, findOptions?: FindOneOptions): Promise<PositionEntity> {
    try {
      return await this.positionRepository.findOneOrFail(id, findOptions);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new UnprocessableEntityException(`Position with id=${id} not found`)
      }
      throw err;
    }
  }

  async unsetChiefForSubEmployees(chiefId: number) {
    await this.employeeRepository.createQueryBuilder()
      .update()
      .set({chief_id: null})
      .where("chief_id =(:chiefId)", {chiefId: chiefId})
      .execute();
  }

  async validateEmployee(employee: EmployeeEntity): Promise<EmployeeEntity> {
    if (!employee.position) {
      employee.position = await this.checkIfPositionExist(employee.position_id);
    }

    //validate only in this case
    if (!employee.chief && typeof employee.chief_id === 'number') {
      employee.chief = await this.checkIfExist(employee.chief_id);
      if (employee.chief.position_id !== employee.position.chief_position_id) {
        throw new ConflictException(`Wrong chief for position(${employee.position_id})`);
      }
    }

    return employee;
  }
  async createWithValidation(employee: EmployeeEntity): Promise<EmployeeEntity> {
    await this.validateEmployee(employee);

    return this.save(employee);
  }

  async updateWithValidation(employee: EmployeeEntity, oldPositionId?: number): Promise<EmployeeEntity> {
    await this.validateEmployee(employee);

    //if ids old & new posId different - delete chief id for subEmployees
    if (employee.position_id !== oldPositionId) {
      await this.unsetChiefForSubEmployees(employee.id);
    }

    await this.save(employee);
    return employee = await this.findById(employee.id);
  }
}