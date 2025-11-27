export type { GeneratedChart } from './chart';

export enum AiProvider {
  GOOGLE = 'GOOGLE',
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE'
}

export interface ApiConfig {
  provider: AiProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
}
