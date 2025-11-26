import { z } from 'zod';

const ALLOWED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0'] as const;
const MODEL_NAME_PATTERN = /^[a-zA-Z0-9_\-:.]+$/;
const CHART_TYPES = ['BAR', 'LINE', 'AREA', 'PIE'] as const;

const LocalhostUrlSchema = z.url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ALLOWED_HOSTNAMES.includes(parsed.hostname as (typeof ALLOWED_HOSTNAMES)[number]);
    } catch {
      return false;
    }
  },
  {
    error: `Invalid URL format. Only localhost connections are allowed for security. Use one of: ${ALLOWED_HOSTNAMES.join(', ')}`
  }
);

const ModelNameSchema = z
  .string({ error: 'Model name is required' })
  .min(1, { error: 'Model name cannot be empty' })
  .max(50, { error: 'Model name is too long (max 50 characters)' })
  .regex(MODEL_NAME_PATTERN, {
    error: 'Model name can only contain letters, numbers, and these characters: _ - : .'
  });

export const OllamaConfigSchema = z.object({
  baseUrl: LocalhostUrlSchema,
  model: ModelNameSchema
});

export const UserQuerySchema = z
  .string({ error: 'Query must be a string' })
  .trim()
  .min(5, { error: 'Query is too short (minimum 5 characters)' })
  .max(500, { error: 'Query is too long (maximum 500 characters)' })
  .refine((query) => query.length > 0, {
    error: 'Query cannot be empty after trimming whitespace'
  });

export const OllamaResponseSchema = z.object({
  model: z.string({ error: 'Response must include model name' }),
  created_at: z.string({ error: 'Response must include creation timestamp' }),
  response: z.string({ error: 'Response must include generated content' }),
  done: z.boolean({ error: 'Response must include completion status' })
});

export const ChartDataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const GeneratedChartSchema = z
  .object({
    title: z
      .string({ error: 'Chart title is required' })
      .min(1, { error: 'Chart title cannot be empty' })
      .max(100, { error: 'Chart title is too long (max 100 characters)' }),
    description: z
      .string({ error: 'Chart description is required' })
      .min(1, { error: 'Chart description cannot be empty' })
      .max(200, { error: 'Chart description is too long (max 200 characters)' }),
    type: z.enum(CHART_TYPES, {
      error: `Chart type must be one of: ${CHART_TYPES.join(', ')}`
    }),
    xAxisKey: z
      .string({ error: 'X-axis key is required' })
      .min(1, { error: 'X-axis key cannot be empty' }),
    dataKey: z
      .string({ error: 'Data key is required' })
      .min(1, { error: 'Data key cannot be empty' }),
    data: z
      .array(ChartDataPointSchema, { error: 'Chart data must be an array' })
      .min(1, { error: 'Chart must have at least one data point' })
      .max(50, { error: 'Too many data points (max 50 for readability)' })
  })
  .refine(
    (chart) => {
      return chart.data.every(
        (point) => point[chart.xAxisKey] !== undefined && point[chart.dataKey] !== undefined
      );
    },
    {
      error: 'All data points must contain both xAxisKey and dataKey fields'
    }
  )
  .refine(
    (chart) => {
      return chart.data.every((point) => typeof point[chart.dataKey] === 'number');
    },
    {
      error: 'All dataKey values must be numbers for proper chart rendering'
    }
  );

export type OllamaConfigInput = z.input<typeof OllamaConfigSchema>;
export type OllamaConfigOutput = z.output<typeof OllamaConfigSchema>;
export type UserQueryInput = z.input<typeof UserQuerySchema>;
export type UserQueryOutput = z.output<typeof UserQuerySchema>;
export type OllamaResponseInput = z.input<typeof OllamaResponseSchema>;
export type OllamaResponseOutput = z.output<typeof OllamaResponseSchema>;
export type ChartDataPointInput = z.input<typeof ChartDataPointSchema>;
export type ChartDataPointOutput = z.output<typeof ChartDataPointSchema>;
export type GeneratedChartInput = z.input<typeof GeneratedChartSchema>;
export type GeneratedChartOutput = z.output<typeof GeneratedChartSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: formatZodError(result.error) };
}
