import supertest from 'supertest';
import { Server } from 'http';
import { server as mainServer } from '../index';
import { transform } from '../utils/transorm';
import path from 'path';
import { fullDir, thumbDir } from '../utils/utils';

const request = supertest(mainServer);

describe('Test endpoint response status', () => {
  let server: Server;

  beforeEach(() => {
    server = mainServer;
  });

  afterEach(() => {
    server.close();
  });

  it('responds to / with status 404', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(404);
  });

  it('The endpoint must return a response with a status of 200', async () => {
    const response = await request.get(
      '/api/images?filename=fjord&width=200&height=200'
    );
    expect(response.status).toBe(200);
  });
});

describe('Test image resizing', () => {
  const width = 200;
  const height = 200;

  const imagePath = path.join(fullDir, 'encenadaport.jpg');
  const thumbPath = path.join(
    thumbDir,
    `encenadaport-${width}-${height}-thumb.jpg`
  );

  it('should resize without error', async () => {
    expect(async () => {
      await transform(imagePath, thumbPath, width, height);
    }).not.toThrow();
  });
});
