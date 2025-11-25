import { MOCK_DATASET, MOCK_SCHEMA } from '@/lib/constants';
import { GeneratedChart } from '@/types/chart';
import { OllamaConfig, OllamaResponse } from '@/types/ollama';

export const generateChartFromPrompt = async (
  prompt: string,
  config: OllamaConfig,
  systemPromptTemplate: string
): Promise<GeneratedChart> => {
  const systemPrompt = systemPromptTemplate
    .replace('{{SCHEMA}}', MOCK_SCHEMA)
    .replace('{{DATASET}}', JSON.stringify(MOCK_DATASET));

  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      prompt: `User Query: ${prompt}`,
      system: systemPrompt,
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API Error: ${response.statusText}`);
  }

  const data: OllamaResponse = await response.json();

  try {
    const parsedChart: GeneratedChart = JSON.parse(data.response);
    return parsedChart;
  } catch (parseError) {
    console.error('Failed to parse Ollama response:', parseError, 'Response:', data.response);
    throw new Error(
      `Failed to parse generated chart data: ${parseError instanceof Error ? parseError.message : String(parseError)}`
    );
  }
};
