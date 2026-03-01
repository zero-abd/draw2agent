import { startHttpServer } from './dist/http-server.js';

async function run() {
  const url = await startHttpServer('http://127.0.0.1:3000', 9742);
  console.log(`Started test server on ${url}`);
}

run().catch(console.error);
