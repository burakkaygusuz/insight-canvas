'use server';

import { generateChartOnServer, generateSuggestionsOnServer } from '@/services/ai-server';
import { ApiConfig, DynamicData, GeneratedChart } from '@/types/ai';
import { promises as fs } from 'node:fs';
import path from 'node:path';

let cachedSystemPrompt: string | null = null;

async function getSystemPrompt() {
  if (!cachedSystemPrompt) {
    const promptPath = path.join(process.cwd(), 'src/prompts/system.md');
    cachedSystemPrompt = await fs.readFile(promptPath, 'utf8');
  }
  return cachedSystemPrompt;
}

export type GenerateActionState = {
  success: boolean;
  chart?: GeneratedChart;
  error?: string;
};

export async function generateChartAction(
  prevState: GenerateActionState,
  formData: FormData
): Promise<GenerateActionState> {
  const prompt = formData.get('prompt') as string;
  const configJson = formData.get('config') as string;
  const dynamicDataJson = formData.get('dynamicData') as string;

  if (!prompt || !configJson) {
    return { success: false, error: 'Missing required data' };
  }

  try {
    const config = JSON.parse(configJson) as ApiConfig;
    const dynamicData = dynamicDataJson ? (JSON.parse(dynamicDataJson) as DynamicData) : undefined;
    const systemPrompt = await getSystemPrompt();

    const chart = await generateChartOnServer(prompt, config, systemPrompt, dynamicData);

    return { success: true, chart };
  } catch (error) {
    console.error('Action Error:', error);
    let message = 'An unexpected error occurred.';

    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        message = 'Invalid API credentials.';
      } else if (error.message.includes('429')) {
        message = 'Rate limit exceeded.';
      } else {
        message = error.message;
      }
    }

    return { success: false, error: message };
  }
}

export async function generateSuggestionsAction(
  config: ApiConfig,
  dynamicData: DynamicData
): Promise<string[]> {
  try {
    const systemPrompt = await getSystemPrompt();
    return await generateSuggestionsOnServer(config, systemPrompt, dynamicData);
  } catch (error) {
    console.error('Suggestion Action Error:', error);
    return [];
  }
}
