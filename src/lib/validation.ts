import { AiProvider } from '@/lib/constants';
import { z } from 'zod';

const MODEL_NAME_PATTERN = /^[a-zA-Z0-9_\-:.]+$/;
const CHART_TYPES = ['BAR', 'LINE', 'AREA', 'PIE'] as const;

const ModelNameSchema = z
  .string({ message: 'Model name is required' })
  .min(1, { message: 'Model name cannot be empty' })
  .max(50, { message: 'Model name is too long (max 50 characters)' })
  .regex(MODEL_NAME_PATTERN, {
    message: 'Model name can only contain letters, numbers, and these characters: _ - : .'
  });

export const ApiConfigSchema = z
  .object({
    provider: z.enum(AiProvider),
    apiKey: z.string().optional(),
    model: ModelNameSchema,
    baseUrl: z.url().optional().or(z.literal(''))
  })
  .superRefine((data, ctx) => {
    if (data.provider === AiProvider.OPENAI) {
      if (!data.apiKey || data.apiKey.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'API Key is required for OpenAI',
          path: ['apiKey']
        });
      }
    }

    if (data.provider === AiProvider.OPENAI_COMPATIBLE) {
      if (!data.baseUrl || data.baseUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Base URL is required for OpenAI Compatible providers',
          path: ['baseUrl']
        });
      }
    }
  });

export const UserQuerySchema = z
  .string({ message: 'Query must be a string' })
  .trim()
  .min(5, { message: 'Query is too short (minimum 5 characters)' })
  .max(500, { message: 'Query is too long (maximum 500 characters)' })
  .refine((query) => query.length > 0, {
    message: 'Query cannot be empty after trimming whitespace'
  });

export const ChartDataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const GeneratedChartSchema = z
  .object({
    title: z
      .string({ message: 'Chart title is required' })
      .min(1, { message: 'Chart title cannot be empty' })
      .max(100, { message: 'Chart title is too long (max 100 characters)' }),
    description: z
      .string({ message: 'Chart description is required' })
      .min(1, { message: 'Chart description cannot be empty' })
      .max(200, { message: 'Chart description is too long (max 200 characters)' }),
    type: z.enum(CHART_TYPES),
    xAxisKey: z
      .string({ message: 'X-axis key is required' })
      .min(1, { message: 'X-axis key cannot be empty' }),
    dataKey: z
      .string({ message: 'Data key is required' })
      .min(1, { message: 'Data key cannot be empty' }),
    data: z
      .array(ChartDataPointSchema)
      .min(1, { message: 'Chart must have at least one data point' })
      .max(50, { message: 'Too many data points (max 50 for readability)' })
  })
  .refine(
    (chart) => {
      return chart.data.every(
        (point) => point[chart.xAxisKey] !== undefined && point[chart.dataKey] !== undefined
      );
    },
    {
      message: 'All data points must contain both xAxisKey and dataKey fields'
    }
  )
  .refine(
    (chart) => {
      return chart.data.every((point) => typeof point[chart.dataKey] === 'number');
    },
    {
      message: 'All dataKey values must be numbers for proper chart rendering'
    }
  );

export type UserQueryInput = z.input<typeof UserQuerySchema>;
export type UserQueryOutput = z.output<typeof UserQuerySchema>;
export type ChartDataPointInput = z.input<typeof ChartDataPointSchema>;
export type ChartDataPointOutput = z.output<typeof ChartDataPointSchema>;
export type GeneratedChartInput = z.input<typeof GeneratedChartSchema>;
export type GeneratedChartOutput = z.output<typeof GeneratedChartSchema>;

export async function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
  const result = await schema.safeParseAsync(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: formatZodError(result.error) };
}

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}
