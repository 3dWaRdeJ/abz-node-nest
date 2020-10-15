import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindOneOptions, Repository} from 'typeorm';
import {EmployeeEntity} from "./employee.entity";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>,
  ) {
  }

  find(take?: number, skip?: number): Promise<EmployeeEntity[]> {
    return this.employeeRepository.find({take: take, skip: skip});
  }

  findById(id: number, findOptions?: FindOneOptions): Promise<EmployeeEntity> {
    return this.employeeRepository.findOne(id, findOptions);
  }

  async save(position): Promise<EmployeeEntity> {
    return this.employeeRepository.save(position);
  }

  async remove(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }

  async setChiefIdByPosition(chiefId: number | null, positionId: number[]) {
    await this.employeeRepository.createQueryBuilder()
      .update()
      .set({chief_id: chiefId})
      .where("position_id IN(:...posId)", {posId: positionId})
      .execute();
  }
}