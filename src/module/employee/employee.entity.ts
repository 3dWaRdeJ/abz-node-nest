import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Index,
  RelationId,
  ManyToOne,
  JoinColumn,
  AfterLoad
} from 'typeorm';
import {PositionEntity} from "../position/position.entity";
import {UserEntity} from "../user/user.entity";

@Entity('employees')
export class EmployeeEntity extends BaseEntity{
  static DEFAULT_PHOTO_PATH = '/img/default.png';
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'full_name', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci'})
  @Index('full_name_IDX')
  fullName: string;

  @Column({type: 'float'})
  @Index('salary_IDX')
  salary: number;

  @Column({
    name: 'start_date',
    type: 'datetime',
    default: () => 'NOW()'
  })
  @Index('start_date_IDX')
  start_date: Date;

  @Column({name: 'phone', length: 16})
  @Index('phone_IDX')
  phone: string;

  @Column()
  @Index('email_IDX')
  email: string;

  @Column({name: 'photo_path', nullable: true})
  photo_path?: string;

  @AfterLoad()
  setDefaultPhotoPathIfNull() {
    if (this.photo_path === null) {
      this.photo_path = EmployeeEntity.DEFAULT_PHOTO_PATH;
    }
  }

  @Column({name: 'chief_id', type: 'integer', nullable: true})
  @RelationId((employee: EmployeeEntity) => employee.chief)
  @Index('chief_IDX')
  chief_id?: number;

  @ManyToOne(
    () => EmployeeEntity,
    employee => employee.subEmployees,
    {onUpdate: 'CASCADE', onDelete: 'SET NULL'}
  )
  @JoinColumn({name: 'chief_id'})
  chief?: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.chief)
  @JoinColumn({name: 'chief_id'})
  subEmployees: EmployeeEntity[];

  @Column({name: 'position_id', type: 'integer'})
  @RelationId((employee: EmployeeEntity) => employee.position)
  @Index('position_id_IDX')
  position_id: number;

  @ManyToOne(
    () => PositionEntity,
    position => position.id,
    {onUpdate: "CASCADE", onDelete: "CASCADE"}
  )
  @JoinColumn({name: 'position_id'})
  position: Position;

  @Column({name: 'admin_create_id', type: 'integer', nullable: false})
  @RelationId((employee: EmployeeEntity) => employee.createAdmin)
  @Index('admin_create_IDX')
  admin_create_id: number;

  @ManyToOne(
    () => UserEntity,
    user => user.createEmployees,
    {onUpdate: "CASCADE"}
  )
  @JoinColumn({name: 'admin_create_id'})
  createAdmin: UserEntity;

  @Column({name: 'admin_update_id', type: 'integer', nullable: false})
  @RelationId((employee: EmployeeEntity) => employee.updateAdmin)
  @Index('admin_update_IDX')
  admin_update_id: number;

  @ManyToOne(
    () => UserEntity,
    user => user.updateEmployees,
    {onUpdate: 'CASCADE',}
  )
  @JoinColumn({name: 'admin_update_id'})
  updateAdmin: UserEntity;


  //timestamps
  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'NOW()'
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'NOW()',
    onUpdate: 'NOW()'
  })
  updated_at: Date;
}