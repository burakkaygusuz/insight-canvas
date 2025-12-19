import { AiProvider } from '@/lib/constants';
export type { GeneratedChart } from './chart';

export interface ApiConfig {
  provider: AiProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type DatasetRow = Record<string, string | number | boolean | null>;

export interface DynamicData {
  dataset: DatasetRow[];
  schema: string;
  fileName: string;
  suggestions?: string[];
}

export type GenerateMode = 'chart' | 'suggestions';

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface ChartGenerator {
  generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<import('./chart').GeneratedChart>;

  generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]>;
}
