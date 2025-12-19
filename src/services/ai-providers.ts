import { GoogleGenAI } from '@google/genai';

import { MAX_ROWS_FOR_AI } from '@/lib/constants';
import { GeneratedChartSchema, safeValidate } from '@/lib/validation';
import { ApiConfig, ChartGenerator, ChatMessage, DynamicData, GeneratedChart } from '@/types/ai';

const REQUEST_TIMEOUT_MS = 60000;

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Continue to next method
  }

  const match = /```json\n([\s\S]*?)\n```/.exec(text);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // Continue to next method
    }
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch {
      // Continue to error
    }
  }

  throw new Error('Failed to parse JSON response');
}

async function parseAndValidateChart(jsonString: string): Promise<GeneratedChart> {
  const parsed = tryParseJson(jsonString);

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'type' in parsed &&
    typeof (parsed as Record<string, unknown>).type === 'string'
  ) {
    const p = parsed as Record<string, unknown>;
    p.type = (p.type as string).toUpperCase();
  }

  const chartValidation = await safeValidate(GeneratedChartSchema, parsed);
  if (!chartValidation.success) {
    throw new Error(`Invalid chart structure: ${chartValidation.error}`);
  }
  return chartValidation.data;
}

export class GoogleGemini implements ChartGenerator {
  async generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<GeneratedChart> {
    if (!config.apiKey) throw new Error('Google API Key is required');
    if (!dynamicData) throw new Error('Please upload a dataset first');

    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const schema = dynamicData.schema;
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const systemPrompt = systemPromptTemplate
      .replace('{{SCHEMA}}', schema)
      .replace('{{DATASET}}', JSON.stringify(dataset));

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nUser Query: ' + prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Google Gemini');
      }
      return parseAndValidateChart(responseText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401'))
        throw new Error('Invalid Google API Key. Please check your settings.');
      if (errorMessage.includes('429'))
        throw new Error('Google API rate limit exceeded. Please try again later.');
      throw new Error(`Google API Error: ${errorMessage}`);
    }
  }

  async generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]> {
    if (!config.apiKey) throw new Error('Google API Key is required');

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const prompt = `
      Analyze the following dataset schema and data sample.
      Generate 3 insightful questions that a user could ask to create meaningful charts/visualizations from this data.
      Return the result as a JSON object with a "suggestions" key containing an array of strings.
      
      Schema:
      ${dynamicData.schema}
      
      Data Sample:
      ${JSON.stringify(dataset)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const responseText = response.text || '{}';
      const parsed = tryParseJson(responseText) as { suggestions?: string[] };
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
}

abstract class BaseOpenAiProvider implements ChartGenerator {
  protected abstract getBaseUrl(config: ApiConfig): string;
  protected abstract getProviderName(): string;

  async generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<GeneratedChart> {
    if (!config.apiKey) throw new Error(`${this.getProviderName()} API Key is required`);
    if (!dynamicData) throw new Error('Please upload a dataset first');

    const schema = dynamicData.schema;
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const systemPrompt = systemPromptTemplate
      .replace('{{SCHEMA}}', schema)
      .replace('{{DATASET}}', JSON.stringify(dataset));

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const content = await this.performRequest(config, messages);
    return parseAndValidateChart(content);
  }

  async generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]> {
    if (!config.apiKey) throw new Error(`${this.getProviderName()} API Key is required`);

    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);
    const prompt = `
      Analyze the following dataset schema and data sample.
      Generate 3 insightful questions that a user could ask to create meaningful charts/visualizations from this data.
      Return the result as a JSON object with a "suggestions" key containing an array of strings.
      
      Schema:
      ${dynamicData.schema}
      
      Data Sample:
      ${JSON.stringify(dataset)}
    `;

    const messages: ChatMessage[] = [{ role: 'user', content: prompt }];

    try {
      const content = await this.performRequest(config, messages);
      const parsed = tryParseJson(content) as { suggestions?: string[] };
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }

  private async performRequest(config: ApiConfig, messages: ChatMessage[]): Promise<string> {
    const baseUrl = this.getBaseUrl(config).replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error(`Invalid ${this.getProviderName()} API Key.`);
        if (response.status === 429)
          throw new Error(`${this.getProviderName()} rate limit exceeded. Please try again later.`);
        const err = await response.text();
        throw new Error(`${this.getProviderName()} API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class OpenAi extends BaseOpenAiProvider {
  protected getBaseUrl(_config: ApiConfig): string {
    return 'https://api.openai.com/v1';
  }

  protected getProviderName(): string {
    return 'OpenAI';
  }
}

export class OpenAiCompatible extends BaseOpenAiProvider {
  protected getBaseUrl(config: ApiConfig): string {
    return config.baseUrl || '';
  }

  protected getProviderName(): string {
    return 'API';
  }
}

export class Anthropic implements ChartGenerator {
  async generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<GeneratedChart> {
    if (!config.apiKey) throw new Error('Anthropic API Key is required');
    if (!dynamicData) throw new Error('Please upload a dataset first');

    const schema = dynamicData.schema;
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const systemPrompt = systemPromptTemplate
      .replace('{{SCHEMA}}', schema)
      .replace('{{DATASET}}', JSON.stringify(dataset));

    const content = await this.performRequest(config, systemPrompt, prompt);
    return parseAndValidateChart(content);
  }

  async generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]> {
    if (!config.apiKey) throw new Error('Anthropic API Key is required');

    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);
    const prompt = `
      Analyze the following dataset schema and data sample.
      Generate 3 insightful questions that a user could ask to create meaningful charts/visualizations from this data.
      Return the result as a JSON object with a "suggestions" key containing an array of strings.
      
      Schema:
      ${dynamicData.schema}
      
      Data Sample:
      ${JSON.stringify(dataset)}
    `;

    try {
      const content = await this.performRequest(config, undefined, prompt);
      const parsed = tryParseJson(content) as { suggestions?: string[] };
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }

  private async performRequest(
    config: ApiConfig,
    systemPrompt: string | undefined,
    userPrompt: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error('Invalid Anthropic API Key. Please check your settings.');
        if (response.status === 429)
          throw new Error('Anthropic rate limit exceeded. Please wait a moment.');
        if (response.status === 400)
          throw new Error(
            'Anthropic API request failed. Please check your input and model selection.'
          );
        const err = await response.text();
        throw new Error(`Anthropic API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
