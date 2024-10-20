import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Unique } from "typeorm"

@Entity('courses.suggested_courses')
@Unique(['url'])
export class SuggestedCourse {
    @PrimaryGeneratedColumn()
    idsuggested: number

    @Column()
    name: string

    @Column()
    platform: string

    @Column()
    url: string
}