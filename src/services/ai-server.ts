import { AiProvider } from '@/lib/constants';
import { safeValidate, UserQuerySchema } from '@/lib/validation';
import { GoogleGemini, OpenAi, OpenAiCompatible } from '@/services/ai-providers';
import { ApiConfig, ChartGenerator, GeneratedChart } from '@/types/ai';

async function validateInputs(prompt: string, config: ApiConfig): Promise<void> {
  const queryValidation = await safeValidate(UserQuerySchema, prompt);
  if (!queryValidation.success) {
    throw new Error(`Invalid query: ${queryValidation.error}`);
  }

  if (!config.model) throw new Error('Model is required');
  if (!config.apiKey) {
    throw new Error('API Key is required');
  }
  if (config.provider === AiProvider.OPENAI_COMPATIBLE && !config.baseUrl) {
    throw new Error('Base URL is required for OpenAI Compatible providers');
  }
}

const strategies: Record<AiProvider, ChartGenerator> = {
  [AiProvider.GOOGLE]: new GoogleGemini(),
  [AiProvider.OPENAI]: new OpenAi(),
  [AiProvider.OPENAI_COMPATIBLE]: new OpenAiCompatible()
};

export async function generateChartOnServer(
  prompt: string,
  config: ApiConfig,
  systemPromptTemplate: string
): Promise<GeneratedChart> {
  await validateInputs(prompt, config);

  const strategy = strategies[config.provider];
  if (!strategy) throw new Error(`Provider ${config.provider} not implemented`);
  return strategy.generate(prompt, systemPromptTemplate, config);
}
