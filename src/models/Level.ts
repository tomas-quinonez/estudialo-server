import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('courses.levels')
export class Level {
    @PrimaryGeneratedColumn()
    idlevel: number

    @Column()
    description: string
}