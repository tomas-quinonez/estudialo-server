import { AppDataSource } from "../data-source";
import { Platform } from "../models/Platform";

export const getPlatformArray = async (): Promise<string[]> => {
  const platformRepository = AppDataSource.getRepository(Platform);
  const platforms: Platform[] = await platformRepository.find({
    select: {
      name: true
    }
  });

  return platforms.map(platform => platform.name);
}