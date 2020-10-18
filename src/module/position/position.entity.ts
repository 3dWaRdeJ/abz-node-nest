import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    Index,
    RelationId,
    ManyToOne,
    JoinColumn,
    OneToMany,
    BeforeInsert, BeforeUpdate
} from 'typeorm';
import {UserEntity} from "../user/user.entity";
import {EmployeeEntity} from "../employee/employee.entity";

@Entity('positions')
export class PositionEntity extends BaseEntity{
    static MAX_LEVEL = 5;
    @PrimaryGeneratedColumn()
    id: number;

    @Column({charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci'})
    @Index('name_IDX')
    name: string;

    @Column({type: 'integer'})
    level: number;

    @Column({name: 'chief_position_id', type: 'integer', nullable: true})
    @RelationId((position: PositionEntity) => position.chiefPosition)
    @Index('chief_position_IDX')
    chief_position_id?: number;

    //relation with chief position(Position Entity)
    @ManyToOne(
        () => PositionEntity,
        position => position.subPositions,
        {
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        }
    )
    @JoinColumn({name: 'chief_position_id'})
    chiefPosition?: PositionEntity;

    @OneToMany(() => PositionEntity, position => position.chiefPosition)
    subPositions: PositionEntity[];

    @Column({name: 'admin_create_id', type: 'varchar', length: 36, nullable: false})
    @RelationId((position: PositionEntity) => position.createAdmin)
    @Index('admin_create_IDX')
    admin_create_id: string;

    @ManyToOne(
      () => UserEntity,
      user => user.createPositions,
      {onUpdate: "CASCADE"}
    )
    @JoinColumn({name: 'admin_create_id', referencedColumnName: 'id'})
    createAdmin: UserEntity;

    @Column({name: 'admin_update_id', type: 'varchar', length: 36, nullable: false})
    @RelationId((position: PositionEntity) => position.updateAdmin)
    @Index('admin_update_IDX')
    admin_update_id: string;

    @ManyToOne(
      () => UserEntity,
      user => user.updatePositions,
      {onUpdate: "CASCADE"}
    )
    @JoinColumn({name: 'admin_update_id', referencedColumnName: 'id'})
    updateAdmin: UserEntity;


    // timestamps
    @Column({
        name: 'created_at',
        type: 'datetime',
        default: () => 'NOW()'
    })
    created_at: Date;

    @Column({
        name: 'updated_at',
        type: 'datetime',
        default: () => 'NOW() ON UPDATE NOW()'
    })
    updated_at: Date;

    //relation with EmployeeEntity
    @OneToMany(() => EmployeeEntity, employee => employee.position)
    employees: EmployeeEntity[];

    //add level to position if forget set
    @BeforeInsert()
    @BeforeUpdate()
    setDefaultLevelIfNotSet() {
        if (!this.level) {
            this.level = PositionEntity.MAX_LEVEL;
        }
    }
}
