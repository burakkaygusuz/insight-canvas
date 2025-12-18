import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { generateChartOnServer, generateSuggestionsOnServer } from '@/services/ai-server';
import { ApiConfig, DynamicData } from '@/types/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, config, dynamicData, mode } = body;

    if (!config) {
      return NextResponse.json({ error: 'Missing config' }, { status: 400 });
    }

    const promptPath = path.join(process.cwd(), 'src/prompts/system.md');
    const systemPromptTemplate = await fs.readFile(promptPath, 'utf8');

    if (mode === 'suggestions' && dynamicData) {
      const suggestions = await generateSuggestionsOnServer(
        config as ApiConfig,
        systemPromptTemplate,
        dynamicData as DynamicData
      );
      return NextResponse.json({ suggestions });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const chart = await generateChartOnServer(
      prompt,
      config as ApiConfig,
      systemPromptTemplate,
      dynamicData
    );

    return NextResponse.json(chart);
  } catch (error) {
    console.error('API Error:', error);

    // Determine a safe, user-friendly error message
    let message = 'An unexpected error occurred while processing your request.';
    let status = 500;

    if (error instanceof Error) {
      // Check for known timeout or connection errors
      if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        message =
          'The AI provider took too long to respond. Please try again with a simpler query.';
        status = 504;
      } else if (error.message.includes('401') || error.message.includes('403')) {
        message = 'Invalid API credentials. Please check your provider settings.';
        status = 401;
      } else if (error.message.includes('429')) {
        message = 'Rate limit exceeded. Please wait a moment.';
        status = 429;
      } else {
        // For other errors, we might want to expose the message if it's not sensitive,
        // but for safety, let's keep it generic unless it's a known safe error type.
        // We'll trust that our client-side logic handles status codes well too.
        message = 'Failed to generate chart. Please check your input and configuration.';
      }
    }

    return NextResponse.json({ error: message }, { status });
  }
}
