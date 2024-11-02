import { FindOperator } from "typeorm";

export interface CourseQuery {
  idcategory?: number;
  idplatform?: number;
  duration?: FindOperator<number>;
  cost?: FindOperator<number>;
  idlevel?: number;
  idmodality?: number;
}

export interface LearningPathAiResponse {
  lista_modulos?: {
    order: number;
    title: string;
    description: string;
  }[];
}

export interface ScrapedCourse {
  name?: string;
  description?: string;
  duration?: number;
  level?: string;
  cost?: number;
  platform?: string;
  category?: string;
  url?: string;
}

export interface CourseFilters {
  input: string;
  idcategory?: number;
  idlevel?: number;
  duration?: number;
  cost?: number;
}

export interface SuggestedCourse {
  name: string;
  platform: string;
  url: string;
}