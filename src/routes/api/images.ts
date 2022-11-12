import express, { Request, Response } from 'express';

import path from 'path';

import { thumbDir } from '../../utils/utils';
import { getImagePath } from '../../utils/getImagePath';
import { transform } from '../../utils/transorm';
import { fileExists } from '../../utils/fileExists';

const router = express.Router();

const cache = new Map<string, string | undefined>();

/* GET home page. */
router.get('/', async (req: Request, res: Response) => {
  const filename = req.query.filename as unknown as string;
  const width = parseFloat(req.query.width as unknown as string);
  const height = parseFloat(req.query.height as unknown as string);

  if (filename === undefined) {
    return res.send('Missing parameter for filename');
  } else if (Object.is(width, NaN)) {
    return res.send('Missing parameter for width');
  } else if (Object.is(height, NaN)) {
    return res.send('Missing parameter for height');
  } else if (width <= 0) {
    return res.send('Invalid input for width');
  } else if (height <= 0) {
    return res.send('Invalid input for height');
  }

  let imagePath: string | undefined;
  const key = `${filename}-${width}-${height}`;
  if (cache.has(key)) {
    imagePath = cache.get(key);
  } else {
    imagePath = await getImagePath(filename);
    cache.set(key, imagePath);
  }

  if (!imagePath) return res.send('Invalid input for filename');

  const { ext } = path.parse(imagePath);
  const fileThumbPath = path.resolve(`${thumbDir}/${key}-thumb${ext}`);
  const exists = await fileExists(fileThumbPath);

  if (!exists) await transform(imagePath, fileThumbPath, width, height);

  res.sendFile(fileThumbPath);
});

export default router;
