import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { imagesRoute } from './routes/images';

export const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api/images', imagesRoute);

// Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// 404 handler
app.notFound((c) =>
  c.json({ error: 'NotFound', message: 'Route not found' }, 404),
);

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    { error: 'InternalError', message: 'An unexpected error occurred' },
    500,
  );
});

export type AppType = typeof app;
