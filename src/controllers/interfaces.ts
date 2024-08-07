import { FindOperator } from "typeorm"

export interface CourseQuery {
    idcategory?: number,
    idplatform?: number,
    duration?: FindOperator<number>,
    cost?: FindOperator<number>,
    idlevel?: number,
    idmodality?: number,
}

export interface AiResponse {
    lista_modulos?: {
        order: number,
        title: string,
        description: string
    }[]
}