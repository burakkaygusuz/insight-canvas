import { ApiConfig, DynamicData, GeneratedChart } from '@/types/ai';

export async function generateChartFromPrompt(
  prompt: string,
  config: ApiConfig,
  dynamicData?: DynamicData
): Promise<GeneratedChart> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, config, dynamicData })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    let friendlyMessage = 'Unable to generate chart. Please verify your data and try again.';

    if (response.status === 401 || response.status === 403) {
      friendlyMessage = 'Authentication failed. Please verify your API key in the settings.';
    } else if (response.status === 429) {
      friendlyMessage =
        "Usage limit exceeded. Please check your provider's plan or try again later.";
    } else if (response.status >= 500) {
      friendlyMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
    } else if (errorData.error) {
      friendlyMessage = typeof errorData.error === 'string' ? errorData.error : friendlyMessage;
    }

    throw new Error(friendlyMessage);
  }

  return response.json();
}

export async function generateSuggestions(
  config: ApiConfig,
  dynamicData: DynamicData
): Promise<string[]> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ config, dynamicData, mode: 'suggestions' })
  });

  if (!response.ok) {
    console.error('Failed to fetch suggestions');
    return [];
  }

  const data = await response.json();
  return data.suggestions || [];
}
