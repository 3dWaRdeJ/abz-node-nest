import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, Index, OneToMany, BeforeUpdate} from 'typeorm';
import {PositionEntity} from "../position/position.entity";
import {EmployeeEntity} from "../employee/employee.entity";

@Entity('users')
export class UserEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

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