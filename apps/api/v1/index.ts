import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import { createApp } from 'src/main';

type ServerlessHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => Promise<unknown>;

let server: ServerlessHandler | null = null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<unknown> {
  if (!server) {
    const app = await createApp();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    server = serverless(
      app.getHttpAdapter().getInstance(),
    ) as ServerlessHandler;
  }

  return server(req, res);
}
