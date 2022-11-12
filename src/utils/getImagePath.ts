import { promises as fsPromises } from 'fs';
import path from 'path';
import { fullDir } from './utils';

export const getImagePath = async (
  filename: string
): Promise<string | undefined> => {
  const images = await fsPromises.readdir(fullDir);

  for (const image of images) {
    const name = image.substring(0, image.lastIndexOf('.'));
    if (name === filename) {
      return path.join(fullDir, image);
    }
  }
};
