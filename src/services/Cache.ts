import { Context, Effect, Layer, Option } from 'effect';

export interface CacheService {
  readonly get: <T>(key: string) => Effect.Effect<Option.Option<T>, never>;
  readonly set: <T>(key: string, value: T) => Effect.Effect<void, never>;
  readonly has: (key: string) => Effect.Effect<boolean, never>;
}

export class Cache extends Context.Tag('Cache')<Cache, CacheService>() {
  static Live = Layer.sync(this, () => this.of(makeInMemoryCache()));
}

const makeInMemoryCache = (): CacheService => {
  const store = new Map<string, unknown>();

  return {
    get: <T>(key: string) =>
      Effect.sync(() =>
        store.has(key) ? Option.some(store.get(key) as T) : Option.none()
      ),

    set: <T>(key: string, value: T) =>
      Effect.sync(() => {
        store.set(key, value);
      }),

    has: (key: string) => Effect.sync(() => store.has(key)),
  };
};
