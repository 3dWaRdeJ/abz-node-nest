import {ConflictException, Injectable, NotFoundException, UnprocessableEntityException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindManyOptions, FindOneOptions, Repository} from 'typeorm';
import { PositionEntity } from './position.entity';
import {EntityNotFoundError} from "typeorm/error/EntityNotFoundError";
import {EmployeeEntity} from "../employee/employee.entity";

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private positionRepository: Repository<PositionEntity>,
    @InjectRepository(EmployeeEntity)
    private employeeRepository: Repository<EmployeeEntity>
  ) {}

  async find(findOptions: FindManyOptions): Promise<PositionEntity[]> {
    return this.positionRepository.find(findOptions);
  }

  findByIdOrFail(id: number, findOptions?: FindOneOptions) {
    return this.positionRepository.findOneOrFail(id, findOptions);
  }

  findById(id: number, findOptions?: FindOneOptions): Promise<PositionEntity> {
    return this.positionRepository.findOne(id, findOptions);
  }

  private async save(position): Promise<PositionEntity> {
    return this.positionRepository.save(position);
  }

  async remove(id: number): Promise<void> {
    await this.positionRepository.delete(id);
  }

  async checkIfExist(id: number, findOptions?: FindOneOptions): Promise<PositionEntity> {
    try {
      return await this.findByIdOrFail(id, findOptions);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new UnprocessableEntityException(`Position with id=${id} not found`)
      }
      throw err;
    }
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
      await this.setEmployeeChiefIdByPositions(null, subPositionsIds);

      //delete relation with chief position for low level positions(subPositions)
      await this.positionRepository.createQueryBuilder()
        .update()
        .set({chief_position_id: null})
        .where("id IN(:...posId)", {posId: subPositionsIds})
        .execute();
    }

    await this.save(position);
    return position = await this.findById(position.id);
  }

  async setEmployeeChiefIdByPositions(chiefId: number | null, positionId: number[]) {
    await this.employeeRepository.createQueryBuilder()
      .update()
      .set({chief_id: chiefId})
      .where("position_id IN(:...posId)", {posId: positionId})
      .execute();
  }

  async validateChiefPosition(position: PositionEntity): Promise<PositionEntity> {
    //add chief position to field, if not set
    if (!position.chiefPosition && typeof position.chief_position_id === 'number') {
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