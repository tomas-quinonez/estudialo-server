import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Course } from "./Course"

@Entity('courses.categories')
export class Category {
    @PrimaryGeneratedColumn()
    idcategory: number

    @Column()
    name: string

    @Column()
    description: string

    @OneToMany(() => Course, (course) => course.category)
    courses: Course[]
}