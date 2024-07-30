import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('courses.modalities')
export class Modality {
    @PrimaryGeneratedColumn()
    idmodality: number

    @Column()
    description: string
}