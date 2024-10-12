import { AppDataSource } from "../data-source";
import { Category } from "../models/Category";

export const getCategoryArray = async (): Promise<string[]> => {
  const categoryRepository = AppDataSource.getRepository(Category);
  const categories: Category[] = await categoryRepository.find({
    select: {
      name: true
    }
  });

  return categories.map(category => category.name);
}