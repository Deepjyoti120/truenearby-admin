import { createServer } from './main';

let cachedServer;

export default async function handler(req, res) {
  if (!cachedServer) {
    cachedServer = await createServer();
  }
  return cachedServer(req, res);
}
