import { Context, Effect, Layer } from 'effect';
import { access, readdir } from 'node:fs/promises';
import { FileSystemError } from '../errors';

export interface FileSystemService {
  readonly readDir: (path: string) => Effect.Effect<string[], FileSystemError>;
  readonly fileExists: (path: string) => Effect.Effect<boolean, never>;
}

export class FileSystem extends Context.Tag('FileSystem')<
  FileSystem,
  FileSystemService
>() {
  static Live = Layer.succeed(
    this,
    this.of({
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
    })
  );
}
