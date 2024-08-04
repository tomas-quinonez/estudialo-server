import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Course } from "./Course"

@Entity('courses.levels')
export class Level {
    @PrimaryGeneratedColumn()
    idlevel: number

    @Column()
    description: string

    @OneToMany(() => Course, (course) => course.level)
    courses: Course[]
}