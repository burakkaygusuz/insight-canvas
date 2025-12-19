export const CHART_COLORS = [
  'var(--color-chart-indigo)',
  'var(--color-chart-violet)',
  'var(--color-chart-pink)',
  'var(--color-chart-rose)',
  'var(--color-chart-orange)',
  'var(--color-chart-yellow)',
  'var(--color-chart-green)',
  'var(--color-chart-cyan)',
  'var(--color-chart-blue)'
] as const;

export enum AiProvider {
  GOOGLE = 'GOOGLE',
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE'
}

export const PROVIDER_LABELS = {
  [AiProvider.GOOGLE]: 'Google Gemini',
  [AiProvider.OPENAI]: 'OpenAI',
  [AiProvider.ANTHROPIC]: 'Anthropic (Claude)',
  [AiProvider.OPENAI_COMPATIBLE]: 'OpenAI Compatible'
};

/* 
  Limit the number of rows sent to AI to stay within context window limits 
  and maintain high accuracy for reasoning.
*/
export const MAX_ROWS_FOR_AI = 500;

export const MAX_FILE_SIZE_MB = 5;
