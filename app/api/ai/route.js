import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import auth from '../../../utils/auth.js'

export const config = {
  runtime: 'edge'
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const systemPrompt = await readFile(path.join(__dirname, 'systemprompt.txt'), 'utf-8');
const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams
  let hasKeyPass = false
  try {
    hasKeyPass = await auth(searchParams.get('walletAddress'))
  } catch(e) {
    console.error(e)
    res.status(500).json({ ok: false })
  }
  const result = streamText({
    model: openrouter('qwen/qwen-max:online'),
    messages: [
      {
        "role": "system",
        "content": systemPrompt
      },
      {
        "role": "user",
        "content": searchParams.get('query')
      }
    ],
  });

  return result.toDataStreamResponse();
}