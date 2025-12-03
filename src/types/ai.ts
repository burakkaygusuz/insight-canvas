export { AiProvider } from '@/lib/constants';
export type { GeneratedChart } from './chart';
import { AiProvider } from '@/lib/constants';
import type { GeneratedChart } from './chart';

export interface ApiConfig {
  provider: AiProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
}

export interface ChartGenerator {
  generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig
  ): Promise<GeneratedChart>;
}
