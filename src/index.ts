import { app } from './app';

const PORT = 3000;

console.log(`🚀 Image Processing API running at http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
