import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('courses.learningpaths')
export class Learningpath {
    @PrimaryGeneratedColumn()
    idpath: number

    @Column()
    name: string

    @Column()
    description: string
}