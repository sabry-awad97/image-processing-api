import { Layer } from 'effect';
import { ImageProcessor, ImageProcessorConfig } from './ImageProcessor';

export { Cache } from './Cache';
export { FileSystem } from './FileSystem';
export { ImageProcessor, ImageProcessorConfig } from './ImageProcessor';

export const makeAppLayer = (config: { fullDir: string; thumbDir: string }) =>
  ImageProcessor.Default.pipe(
    Layer.provide(Layer.succeed(ImageProcessorConfig, config)),
  );
