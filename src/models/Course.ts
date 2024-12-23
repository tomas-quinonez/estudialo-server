import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Category } from "./Category"
import { Level } from "./Level"
import { Platform } from "./Platform"
import { Modality } from "./Modality"

@Entity('courses.courses')
export class Course {
    @PrimaryGeneratedColumn()
    idcourse: number

    @Column({ nullable: true })
    idcategory: number

    @Column({ nullable: true })
    idplatform: number

    @Column()
    code: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    duration: number

    @Column()
    cost: number

    @Column({ nullable: true })
    dollarcost: number

    @Column({ nullable: true })
    dollarvalue: number

    @Column({ nullable: true })
    idlevel: number

    @Column({ nullable: true })
    idmodality: number

    @Column({ nullable: true })
    idpath: number

    @Column()
    url: string

    @Column()
    priority: number

    @ManyToOne(() => Category, (category) => category.courses)
    @JoinColumn({ name: 'idcategory' })
    category: Category

    @ManyToOne(() => Platform, (platform) => platform.courses)
    @JoinColumn({ name: 'idplatform' })
    platform: Platform

    @ManyToOne(() => Level, (level) => level.courses)
    @JoinColumn({ name: 'idlevel' })
    level: Level

    @ManyToOne(() => Modality, (modality) => modality.courses)
    @JoinColumn({ name: 'idmodality' })
    modality: Modality
}