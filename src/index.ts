import express, { Request, Response } from 'express';
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { object, string } from 'zod';

const PORT = 3000;
const fullDir = './assets/full';
const thumbDir = './assets/thumb';

const app = express();

const cache = new Map<string, string | undefined>();

class ImageProcessor {
  constructor(private fullDir: string, private thumbDir: string) {}

  public async transformImage(
    input: string,
    output: string,
    width: number,
    height: number
  ): Promise<void> {
    try {
      await sharp(input)
        .resize(width, height, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toFile(output);
    } catch (error) {
      console.log(`An error occurred during processing: ${error}`);
      throw new Error('Image processing failed');
    }
  }

  public async getImagePath(filename: string): Promise<string> {
    try {
      const images = await readdir(this.fullDir);
      const foundImage = images.find(image => {
        const name = path.parse(image).name;
        return name === filename;
      });

      if (foundImage) {
        return path.join(this.fullDir, foundImage);
      }

      throw new Error('Image not found');
    } catch (error) {
      console.log(`Error while retrieving image path: ${error}`);
      throw new Error('Failed to retrieve image');
    }
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async processImage(
    filename: string,
    widthStr: string,
    heightStr: string
  ): Promise<string> {
    try {
      const width = parseInt(widthStr);
      const height = parseInt(heightStr);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new Error('Invalid width or height');
      }

      const key = `${filename}-${width}-${height}`;
      let imagePath = cache.get(key);

      if (!imagePath) {
        imagePath = await this.getImagePath(filename);

        const { ext } = path.parse(imagePath);
        const fileThumbPath = path.resolve(
          `${this.thumbDir}/${key}-thumb${ext}`
        );
        const exists = await this.fileExists(fileThumbPath);

        if (!exists) {
          await this.transformImage(imagePath, fileThumbPath, width, height);
        }

        imagePath = fileThumbPath;
        cache.set(key, imagePath);
      }

      return imagePath;
    } catch (error) {
      console.log(`An error occurred: ${error}`);
      throw new Error('Failed to process image');
    }
  }
}

const ImageProcessingSchema = object({
  filename: string(),
  width: string().regex(/^\d+$/),
  height: string().regex(/^\d+$/),
});

app.get('/api/images', async (req: Request, res: Response) => {
  try {
    const { filename, width, height } = ImageProcessingSchema.parse(req.query);

    const processor = new ImageProcessor(fullDir, thumbDir);
    const imagePath = await processor.processImage(filename, width, height);

    res.sendFile(imagePath);
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
