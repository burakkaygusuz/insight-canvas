import { ApiConfig, GeneratedChart } from '@/types/ai';

export async function generateChartFromPrompt(
  prompt: string,
  config: ApiConfig
): Promise<GeneratedChart> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, config })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}
