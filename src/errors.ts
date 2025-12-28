import { Data } from 'effect';

export class ImageNotFoundError extends Data.TaggedError('ImageNotFoundError')<{
  readonly filename: string;
  readonly message: string;
}> {}

export class ImageProcessingError extends Data.TaggedError(
  'ImageProcessingError'
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
  readonly errors: readonly string[];
}> {}

export class FileSystemError extends Data.TaggedError('FileSystemError')<{
  readonly operation: string;
  readonly path: string;
  readonly cause?: unknown;
}> {}

export type AppError =
  | ImageNotFoundError
  | ImageProcessingError
  | ValidationError
  | FileSystemError;
