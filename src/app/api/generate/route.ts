import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { generateChartOnServer } from '@/services/ai-server';
import { ApiConfig } from '@/types/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, config } = body;

    if (!prompt || !config) {
      return NextResponse.json({ error: 'Missing prompt or config' }, { status: 400 });
    }

    const promptPath = path.join(process.cwd(), 'src/prompts/system.md');
    const systemPromptTemplate = await fs.readFile(promptPath, 'utf8');

    const chart = await generateChartOnServer(prompt, config as ApiConfig, systemPromptTemplate);

    return NextResponse.json(chart);
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
