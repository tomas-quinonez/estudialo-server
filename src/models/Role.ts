import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('users.roles')
export class Role {
    @PrimaryGeneratedColumn()
    idrole: number

    @Column()
    name: string
}