import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {FindOneOptions, Repository} from 'typeorm';
import { PositionEntity } from './position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private positionRepository: Repository<PositionEntity>,
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

  async checkIfExist(id: number, findOptions: FindOneOptions): Promise<PositionEntity> {
    const position = await this.findById(id, findOptions);
    if (position instanceof PositionEntity === false) {
      throw new NotFoundException('Position with id not found');
    }
    return position;
  }
}