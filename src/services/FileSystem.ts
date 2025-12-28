import { Effect } from 'effect';
import { access, readdir } from 'node:fs/promises';
import { FileSystemError } from '../errors';

export class FileSystem extends Effect.Service<FileSystem>()('FileSystem', {
  effect: Effect.sync(() => ({
    readDir: (path: string) =>
      Effect.tryPromise({
        try: () => readdir(path),
        catch: (error) =>
          new FileSystemError({
            operation: 'readDir',
            path,
            cause: error,
          }),
      }),

    fileExists: (path: string) =>
      Effect.tryPromise({
        try: async () => {
          await access(path);
          return true;
        },
        catch: () => false,
      }).pipe(Effect.catchAll(() => Effect.succeed(false))),
  })),
}) {}
