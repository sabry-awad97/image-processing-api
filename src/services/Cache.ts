import { Effect, Option } from 'effect';

const makeInMemoryCache = () => {
  const store = new Map<string, unknown>();

  return {
    get: <T>(key: string) =>
      Effect.sync(() =>
        store.has(key) ? Option.some(store.get(key) as T) : Option.none(),
      ),

    set: <T>(key: string, value: T) =>
      Effect.sync(() => {
        store.set(key, value);
      }),

    has: (key: string) => Effect.sync(() => store.has(key)),
  };
};

export class Cache extends Effect.Service<Cache>()('Cache', {
  effect: Effect.sync(() => makeInMemoryCache()),
}) {}
