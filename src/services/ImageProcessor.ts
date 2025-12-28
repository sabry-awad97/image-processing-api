import { Context, Effect, Layer, Option } from 'effect';
import path from 'node:path';
import sharp from 'sharp';
import { ImageNotFoundError, ImageProcessingError } from '../errors';
import { Cache } from './Cache';
import { FileSystem } from './FileSystem';

export interface IImageProcessorConfig {
  readonly fullDir: string;
  readonly thumbDir: string;
}

export interface ImageProcessorService {
  readonly transform: (
    input: string,
    output: string,
    width: number,
    height: number
  ) => Effect.Effect<void, ImageProcessingError>;

  readonly getImagePath: (
    filename: string
  ) => Effect.Effect<string, ImageNotFoundError>;

  readonly processImage: (
    filename: string,
    width: number,
    height: number
  ) => Effect.Effect<string, ImageNotFoundError | ImageProcessingError>;
}

export class ImageProcessor extends Context.Tag('ImageProcessor')<
  ImageProcessor,
  ImageProcessorService
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const config = yield* ImageProcessorConfig;
      const fileSystem = yield* FileSystem;
      const cache = yield* Cache;
      return ImageProcessor.of(makeImageProcessor(config, fileSystem, cache));
    })
  );
}

export class ImageProcessorConfig extends Context.Tag('ImageProcessorConfig')<
  ImageProcessorConfig,
  IImageProcessorConfig
>() {}

const makeImageProcessor = (
  config: IImageProcessorConfig,
  fileSystem: FileSystem['Type'],
  cache: Cache['Type']
): ImageProcessorService => ({
  transform: (input, output, width, height) =>
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

  getImagePath: (filename) =>
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
          })
        );
      }

      return path.join(config.fullDir, foundImage);
    }),

  processImage: (filename, width, height) =>
    Effect.gen(function* () {
      const key = `${filename}-${width}-${height}`;

      const cached = yield* cache.get<string>(key);
      if (Option.isSome(cached)) {
        return cached.value;
      }

      const imagePath = yield* makeImageProcessor(
        config,
        fileSystem,
        cache
      ).getImagePath(filename);
      const { ext } = path.parse(imagePath);
      const thumbPath = path.resolve(`${config.thumbDir}/${key}-thumb${ext}`);

      const exists = yield* fileSystem.fileExists(thumbPath);
      if (!exists) {
        yield* makeImageProcessor(config, fileSystem, cache).transform(
          imagePath,
          thumbPath,
          width,
          height
        );
      }

      yield* cache.set(key, thumbPath);
      return thumbPath;
    }),
});
