import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindOneOptions, Repository} from 'typeorm';
import { PositionEntity } from './position.entity';
import {EmployeeEntity} from "../employee/employee.entity";
import {EmployeeService} from "../employee/employee.service";

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private positionRepository: Repository<PositionEntity>,
    private readonly employeeService: EmployeeService
  ) {}

  find(take?: number, skip?: number): Promise<PositionEntity[]> {
    return this.positionRepository.find({take: take, skip: skip});
  }

  findById(id: number, findOptions?: FindOneOptions): Promise<PositionEntity> {
    return this.positionRepository.findOne(id, findOptions);
  }

  async save(position): Promise<PositionEntity> {
    return this.positionRepository.save(position);
  }

  async remove(id: number): Promise<void> {
    await this.positionRepository.delete(id);
  }

  async checkIfExist(id: number, findOptions?: FindOneOptions): Promise<PositionEntity> {
    const position = await this.findById(id, findOptions);
    if (!(position instanceof PositionEntity)) {
      throw new NotFoundException(`Position with id=${id} not found`);
    }
    return position;
  }

  async createWithValidation(position: PositionEntity): Promise<PositionEntity> {
    await this.validateChiefPosition(position);

    return this.save(position);
  }

  async updateWithValidation(position: PositionEntity, oldChiefPosId: number): Promise<PositionEntity> {
    await this.validateChiefPosition(position);

    //if ids different - update sub records(subPositions and subPositions.employees)
    if (oldChiefPosId !== position.chief_position_id) {
      const subPositionsIds = position.subPositions.map((position: PositionEntity) => position.id);

      //delete relations with chiefs for low level employees in subPositions
      await this.employeeService.setChiefIdByPosition(null, subPositionsIds);

      //delete relation with chief position for low level positions(subPositions)
      await this.positionRepository.createQueryBuilder()
        .update()
        .set({chief_position_id: null})
        .where("id IN(:...posId)", {posId: subPositionsIds})
        .execute();
    }

    return await this.save(position);
  }

  async validateChiefPosition(position: PositionEntity): Promise<PositionEntity> {
    //add chief position to field, if not set
    if (!position.chiefPosition && position.chief_position_id) {
      position.chiefPosition = await this.checkIfExist(position.chief_position_id);
    }

    //if chief position set
    if (position.chiefPosition instanceof PositionEntity) {
      //validate chief position level
      if (position.chiefPosition.level === 1) {
        throw new ConflictException('Chief position level must be > 1')
      }

      position.level = position.chiefPosition.level - 1;
    }
    return position;
  }
}