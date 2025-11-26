import { MOCK_DATASET, MOCK_SCHEMA } from '@/lib/constants';
import {
  GeneratedChartSchema,
  OllamaConfigSchema,
  OllamaResponseSchema,
  safeValidate,
  UserQuerySchema
} from '@/lib/validation';
import { GeneratedChart } from '@/types/chart';
import { OllamaConfig } from '@/types/ollama';

const REQUEST_TIMEOUT_MS = 30000;

function validateInputs(prompt: string, config: OllamaConfig): void {
  const queryValidation = safeValidate(UserQuerySchema, prompt);
  if (!queryValidation.success) {
    throw new Error(`Invalid query: ${queryValidation.error}`);
  }

  const configValidation = safeValidate(OllamaConfigSchema, config);
  if (!configValidation.success) {
    throw new Error(`Invalid configuration: ${configValidation.error}`);
  }
}

function validateAndParseResponse(data: unknown): GeneratedChart {
  const responseValidation = safeValidate(OllamaResponseSchema, data);
  if (!responseValidation.success) {
    throw new Error(`Invalid Ollama response: ${responseValidation.error}`);
  }

  const parsedChart = JSON.parse(responseValidation.data.response);

  const chartValidation = safeValidate(GeneratedChartSchema, parsedChart);
  if (!chartValidation.success) {
    throw new Error(`Invalid chart: ${chartValidation.error}`);
  }

  return chartValidation.data;
}

function handleFetchError(error: unknown): never {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Try a simpler query.`
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error('LLM returned invalid JSON. Try rephrasing your query.');
    }
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to Ollama. Ensure it is running with CORS enabled.');
    }
  }
  throw error;
}

export const generateChartFromPrompt = async (
  prompt: string,
  config: OllamaConfig,
  systemPromptTemplate: string
): Promise<GeneratedChart> => {
  validateInputs(prompt, config);

  const systemPrompt = systemPromptTemplate
    .replace('{{SCHEMA}}', MOCK_SCHEMA)
    .replace('{{DATASET}}', JSON.stringify(MOCK_DATASET));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: `User Query: ${prompt}`,
        system: systemPrompt,
        stream: false,
        format: 'json'
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return validateAndParseResponse(data);
  } catch (error) {
    handleFetchError(error);
  } finally {
    clearTimeout(timeoutId);
  }
};
