import { Effect } from 'effect';
import { z } from 'zod';
import { ValidationError } from './errors';

export const ImageProcessingSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  width: z
    .string()
    .regex(/^\d+$/, 'Width must be a positive integer')
    .transform(Number),
  height: z
    .string()
    .regex(/^\d+$/, 'Height must be a positive integer')
    .transform(Number),
});

export type ImageProcessingInput = z.infer<typeof ImageProcessingSchema>;

export const parseImageProcessingQuery = (
  query: Record<string, string | undefined>,
): Effect.Effect<ImageProcessingInput, ValidationError> =>
  Effect.try({
    try: () => ImageProcessingSchema.parse(query),
    catch: (error) => {
      const zodError = error as z.ZodError;
      return new ValidationError({
        message: 'Invalid query parameters',
        errors: zodError.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    },
  });
