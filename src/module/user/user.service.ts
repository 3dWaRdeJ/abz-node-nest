import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as UserDto from "../../../../test/src/module/user/user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  find(options = {}): Promise<UserEntity[]> {
    if (typeof options['take'] !== 'number') {
      options['take'] = 20;
    }
    if (typeof options['skip'] !== 'number') {
      options['skip'] = 0;
    }
    return this.userRepository.find(options);
  }

  findAll(options = {}): Promise<UserEntity[]> {
    delete options['take'];
    delete options['skip'];
    return this.userRepository.find(options);
  }

  async findRand(): Promise<UserEntity> {
    const raws = await this.userRepository.query('SELECT * FROM users ORDER BY RAND() LIMIT 1');
    let user = new UserEntity();
    user = Object.assign(user, raws[0]);
    return user;
  }

  async findOne(id: number | string): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new NotFoundException(['User with this id does not exist']);
  }

  create(createDto: UserDto.CreateDto): Promise<UserEntity> {
    const newUser = Object.assign(new UserEntity(), createDto);
    return this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({where: [{email: email}]});
    if (user) {
      return  user;
    }
    throw new NotFoundException(['User with this email does not exist']);
  }

  async remove(id: number| string): Promise<void> {
    await this.userRepository.delete(id);
  }
}