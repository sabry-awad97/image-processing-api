import { Layer } from 'effect';
import { Cache } from './Cache';
import { FileSystem } from './FileSystem';
import { ImageProcessor, ImageProcessorConfig } from './ImageProcessor';

export { Cache } from './Cache';
export { FileSystem } from './FileSystem';
export { ImageProcessor, ImageProcessorConfig } from './ImageProcessor';

export const makeAppLayer = (config: { fullDir: string; thumbDir: string }) =>
  ImageProcessor.Live.pipe(
    Layer.provide(FileSystem.Live),
    Layer.provide(Cache.Live),
    Layer.provide(Layer.succeed(ImageProcessorConfig, config))
  );
