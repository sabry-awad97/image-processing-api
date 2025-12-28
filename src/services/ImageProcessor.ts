import { Context, Effect, Option } from 'effect';
import path from 'node:path';
import sharp from 'sharp';
import { ImageNotFoundError, ImageProcessingError } from '../errors';
import { Cache } from './Cache';
import { FileSystem } from './FileSystem';

export interface IImageProcessorConfig {
  readonly fullDir: string;
  readonly thumbDir: string;
}

export class ImageProcessorConfig extends Context.Tag('ImageProcessorConfig')<
  ImageProcessorConfig,
  IImageProcessorConfig
>() {}

const makeImageProcessor = (
  config: IImageProcessorConfig,
  fileSystem: typeof FileSystem.Service,
  cache: typeof Cache.Service,
) => ({
  transform: (input: string, output: string, width: number, height: number) =>
    Effect.tryPromise({
      try: () =>
        sharp(input)
          .resize(width, height, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .toFile(output),
      catch: (error) =>
        new ImageProcessingError({
          message: 'Failed to transform image',
          cause: error,
        }),
    }).pipe(Effect.asVoid),

  getImagePath: (filename: string) =>
    Effect.gen(function* () {
      const images = yield* fileSystem
        .readDir(config.fullDir)
        .pipe(Effect.catchAll(() => Effect.succeed([] as string[])));

      const foundImage = images.find((image) => {
        const name = path.parse(image).name;
        return name === filename;
      });

      if (!foundImage) {
        return yield* Effect.fail(
          new ImageNotFoundError({
            filename,
            message: `Image '${filename}' not found in ${config.fullDir}`,
          }),
        );
      }

      return path.join(config.fullDir, foundImage);
    }),

  processImage: (filename: string, width: number, height: number) =>
    Effect.gen(function* () {
      const key = `${filename}-${width}-${height}`;
      const processor = makeImageProcessor(config, fileSystem, cache);

      const cached = yield* cache.get<string>(key);
      if (Option.isSome(cached)) {
        return cached.value;
      }

      const imagePath = yield* processor.getImagePath(filename);
      const { ext } = path.parse(imagePath);
      const thumbPath = path.resolve(`${config.thumbDir}/${key}-thumb${ext}`);

      const exists = yield* fileSystem.fileExists(thumbPath);
      if (!exists) {
        yield* processor.transform(imagePath, thumbPath, width, height);
      }

      yield* cache.set(key, thumbPath);
      return thumbPath;
    }),
});

export class ImageProcessor extends Effect.Service<ImageProcessor>()(
  'ImageProcessor',
  {
    effect: Effect.gen(function* () {
      const config = yield* ImageProcessorConfig;
      const fileSystem = yield* FileSystem;
      const cache = yield* Cache;
      return makeImageProcessor(config, fileSystem, cache);
    }),
    dependencies: [FileSystem.Default, Cache.Default],
  },
) {}
