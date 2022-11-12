import { access } from 'fs/promises';

export const fileExists: (filePath: string) => Promise<boolean> = async (
  filePath: string
) => {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};
