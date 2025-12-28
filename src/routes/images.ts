import { Effect, Exit } from 'effect';
import { Hono } from 'hono';
import type { AppError } from '../errors';
import { ValidationError } from '../errors';
import { parseImageProcessingQuery } from '../schemas';
import { ImageProcessor, makeAppLayer } from '../services';

const FULL_DIR = './assets/full';
const THUMB_DIR = './assets/thumb';

const appLayer = makeAppLayer({
  fullDir: FULL_DIR,
  thumbDir: THUMB_DIR,
});

const runEffect = <A, E extends AppError>(
  effect: Effect.Effect<A, E, ImageProcessor>
): Promise<Exit.Exit<A, E>> =>
  effect.pipe(Effect.provide(appLayer), Effect.runPromiseExit);

const formatError = (
  error: AppError
): { error: string; message: string; details?: unknown } => {
  switch (error._tag) {
    case 'ValidationError':
      return {
        error: error._tag,
        message: error.message,
        details: error.errors,
      };
    case 'ImageNotFoundError':
      return {
        error: error._tag,
        message: error.message,
      };
    case 'ImageProcessingError':
      return {
        error: error._tag,
        message: error.message,
      };
    case 'FileSystemError':
      return {
        error: error._tag,
        message: `${error.operation} failed for path: ${error.path}`,
      };
  }
};

export const imagesRoute = new Hono();

imagesRoute.get('/', async (c) => {
  const query = c.req.query();

  const program = Effect.gen(function* () {
    const input = yield* parseImageProcessingQuery(query);

    if (input.width <= 0 || input.height <= 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: 'Width and height must be positive integers',
          errors: ['width and height must be greater than 0'],
        })
      );
    }

    const imageProcessor = yield* ImageProcessor;
    const imagePath = yield* imageProcessor.processImage(
      input.filename,
      input.width,
      input.height
    );

    return imagePath;
  });

  const exit = await runEffect(program);

  if (Exit.isSuccess(exit)) {
    const file = Bun.file(exit.value);
    return new Response(file);
  }

  const error = exit.cause;
  if (error._tag === 'Fail') {
    const appError = error.error as AppError;
    return c.json(formatError(appError), 400);
  }

  return c.json(
    { error: 'InternalError', message: 'An unexpected error occurred' },
    500
  );
});
