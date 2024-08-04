import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Course } from "./Course"

@Entity('courses.modalities')
export class Modality {
    @PrimaryGeneratedColumn()
    idmodality: number

    @Column()
    description: string

    @OneToMany(() => Course, (course) => course.modality)
    courses: Course[]
}