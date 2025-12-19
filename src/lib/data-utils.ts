import { redactData } from '@/lib/privacy';
import { DatasetRow } from '@/types/ai';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface FileData {
  schema: string;
  dataset: DatasetRow[];
  fileName: string;
  suggestions: string[];
}

export async function parseFile(file: File): Promise<FileData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: false,
        complete: (results) => {
          const rawData = results.data as DatasetRow[];
          const redactedData = redactData(rawData);
          resolve({
            schema: generateSchemaFromData(redactedData),
            dataset: redactedData,
            fileName: file.name,
            suggestions: generateSuggestions(redactedData)
          });
        },
        error: (error: unknown) => reject(error)
      });
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<DatasetRow>(worksheet);
    const redactedData = redactData(json);
    return {
      schema: generateSchemaFromData(redactedData),
      dataset: redactedData,
      fileName: file.name,
      suggestions: generateSuggestions(redactedData)
    };
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel.');
  }
}

function generateSuggestions(data: DatasetRow[]): string[] {
  if (!data || data.length === 0) return [];
  const row = data[0];
  const keys = Object.keys(row);
  const numericKeys = keys.filter((k) => typeof row[k] === 'number');
  const stringKeys = keys.filter((k) => typeof row[k] === 'string');
  const dateKey = keys.find(
    (k) =>
      k.toLowerCase().includes('date') ||
      k.toLowerCase().includes('time') ||
      k.toLowerCase().includes('year')
  );

  const suggestions: string[] = [];

  if (numericKeys.length > 0) {
    suggestions.push(`Show total ${numericKeys[0]}`);
    if (stringKeys.length > 0) {
      suggestions.push(`${numericKeys[0]} by ${stringKeys[0]}`);
    }
  }

  if (dateKey && numericKeys.length > 0) {
    suggestions.push(`${numericKeys[0]} trend over time`);
  } else if (numericKeys.length > 1) {
    suggestions.push(`Compare ${numericKeys[0]} vs ${numericKeys[1]}`);
  } else if (stringKeys.length > 0) {
    suggestions.push(`Count by ${stringKeys[0]}`);
  }

  return suggestions.slice(0, 3);
}

function generateSchemaFromData(data: DatasetRow[]): string {
  if (!data || data.length === 0) return '';

  const firstRow = data[0];
  const schemaParts: string[] = [];

  Object.entries(firstRow).forEach(([key, value]) => {
    const type = typeof value;
    schemaParts.push(`${key} (${type})`);
  });

  return `Columns: ${schemaParts.join(', ')}`;
}

export function datasetToCsv(data: DatasetRow[]): string {
  if (!data || data.length === 0) return '';
  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const val = row[key];
        // Handle strings with commas or quotes
        if (
          typeof val === 'string' &&
          (val.includes(',') || val.includes('"') || val.includes('\n'))
        ) {
          return `"${val.replaceAll('"', '""')}"`;
        }
        return String(val ?? '');
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export function getSampleData(data: DatasetRow[], limit: number = 5): DatasetRow[] {
  return data.slice(0, limit);
}
