import { GoogleGenAI } from '@google/genai';

import { MAX_ROWS_FOR_AI } from '@/lib/constants';
import { GeneratedChartSchema, safeValidate } from '@/lib/validation';
import { ApiConfig, ChartGenerator, DynamicData, GeneratedChart } from '@/types/ai';

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

export class OpenAi implements ChartGenerator {
  async generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<GeneratedChart> {
    if (!config.apiKey) throw new Error('OpenAI API Key is required');
    if (!dynamicData) throw new Error('Please upload a dataset first');

    const schema = dynamicData.schema;
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const systemPrompt = systemPromptTemplate
      .replace('{{SCHEMA}}', schema)
      .replace('{{DATASET}}', JSON.stringify(dataset));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return parseAndValidateChart(content);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]> {
    if (!config.apiKey) throw new Error('OpenAI API Key is required');

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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = tryParseJson(content) as { suggestions?: string[] };
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
}

export class OpenAiCompatible implements ChartGenerator {
  async generate(
    prompt: string,
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData?: DynamicData
  ): Promise<GeneratedChart> {
    const baseUrl = config.baseUrl!;
    if (!dynamicData) throw new Error('Please upload a dataset first');

    const schema = dynamicData.schema;
    const dataset = dynamicData.dataset.slice(0, MAX_ROWS_FOR_AI);

    const systemPrompt = systemPromptTemplate
      .replace('{{SCHEMA}}', schema)
      .replace('{{DATASET}}', JSON.stringify(dataset));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey!}`
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return parseAndValidateChart(content);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateSuggestions(
    systemPromptTemplate: string,
    config: ApiConfig,
    dynamicData: DynamicData
  ): Promise<string[]> {
    const baseUrl = config.baseUrl!;
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
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey!}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = tryParseJson(content) as { suggestions?: string[] };
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
}
