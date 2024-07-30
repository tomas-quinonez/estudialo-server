import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('courses.categories')
export class Category {
    @PrimaryGeneratedColumn()
    idcategory: number

    @Column()
    name: string

    @Column()
    description: string
}