import { startHttpServer } from './src/http-server.js';
startHttpServer('http://127.0.0.1:3000', 9742).then(() => {
  console.log("Started test server on 9742");
});
