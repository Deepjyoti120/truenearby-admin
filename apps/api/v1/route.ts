import { NextRequest } from 'next/server';
import serverless from 'serverless-http';
import { createApp } from '../../../../api/src/main';

let server: ((req: any, res: any) => Promise<any>) | null = null;

export async function GET(req: NextRequest) {
  if (!server) {
    const app = await createApp();
    server = serverless(app.getHttpAdapter().getInstance());
  }

  // Adapt NextRequest → Node req/res
  const { req: nodeReq, res: nodeRes } = require('next/dist/server/api-utils/node');
  return server(nodeReq, nodeRes);
}
