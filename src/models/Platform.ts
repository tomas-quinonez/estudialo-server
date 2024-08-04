import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Course } from "./Course"

@Entity('courses.platforms')
export class Platform {
    @PrimaryGeneratedColumn()
    idplatform: number

    @Column()
    name: string

    @Column()
    description: string

    @OneToMany(() => Course, (course) => course.platform)
    courses: Course[]
}