import {
    Entity,
    Column,
    BaseEntity,
    Index,
    OneToMany,
    BeforeUpdate,
    BeforeInsert
} from 'typeorm';
import {PositionEntity} from "../position/position.entity";
import {EmployeeEntity} from "../employee/employee.entity";
import { CurrentAdmin } from "admin-bro/src/current-admin.interface"
import {v4} from 'uuid';

@Entity('users')
export class UserEntity extends BaseEntity implements CurrentAdmin{
    @Column({name: 'id', nullable: false, primary: true, type: 'varchar', length: 36})
    id: string;

    @BeforeInsert()
    generateUUID() {
        this.id = v4();
    }

    @Column()
    name: string;

    @Column({unique: true})
    @Index('email_IDX')
    email: string;

    @Column()
    password: string;

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
        default: () => 'NOW() ON UPDATE NOW()'
    })
    updated_at: Date;

    @BeforeUpdate()
    updateDate() {
        this.created_at = new Date();
    }

    @OneToMany(() => PositionEntity, position => position.createAdmin)
    createPositions: Position[];

    @OneToMany(() => PositionEntity, position => position.updateAdmin)
    updatePositions: Position[];

    @OneToMany(() => EmployeeEntity, employee => employee.createAdmin)
    createEmployees: Position[];

    @OneToMany(() => EmployeeEntity, employee => employee.updateAdmin)
    updateEmployees: Position[];
}