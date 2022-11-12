import express from 'express';
import { createServer } from 'http';
import apiRoutes from './routes';

const PORT = process.env.PORT || 3000;

export const app = express();

app.use('/api', apiRoutes);

app.set('port', PORT);

export const server = createServer(app);

server.listen(PORT);

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  addr;
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  console.log(`Listening on ${bind}`);
});
