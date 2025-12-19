import { AiProvider, MAX_FILE_SIZE_MB } from '@/lib/constants';
import { z } from 'zod';

const MODEL_NAME_PATTERN = /^[a-zA-Z0-9_\-:.]+$/;
const CHART_TYPES = ['BAR', 'LINE', 'AREA', 'PIE'] as const;
const ACCEPTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

export const FileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, {
    message: `The file is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`
  })
  .refine(
    (file) => {
      // Check MIME type or extension as a fallback
      return ACCEPTED_FILE_TYPES.includes(file.type) || /\.(csv|xlsx|xls)$/i.test(file.name);
    },
    {
      message: 'Unsupported file format. Please upload a CSV or Excel (.xlsx, .xls) file.'
    }
  );

const ModelNameSchema = z
  .string({ message: 'Please provide a model name.' })
  .min(1, { message: 'Model name cannot be empty.' })
  .max(50, { message: 'The model name is too long (maximum 50 characters).' })
  .regex(MODEL_NAME_PATTERN, {
    message: 'Model names can only contain letters, numbers, and the following characters: _ - : .'
  });

export const ApiConfigSchema = z
  .object({
    provider: z.enum(AiProvider),
    apiKey: z.string().optional(),
    model: ModelNameSchema,
    baseUrl: z.url({ message: 'Please enter a valid URL.' }).optional().or(z.literal(''))
  })
  .superRefine((data, ctx) => {
    if (data.provider === AiProvider.OPENAI) {
      if (!data.apiKey || data.apiKey.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'An API Key is required for OpenAI.',
          path: ['apiKey']
        });
      }
    }

    if (data.provider === AiProvider.OPENAI_COMPATIBLE) {
      if (!data.baseUrl || data.baseUrl.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'A Base URL is required for this provider.',
          path: ['baseUrl']
        });
      }
    }
  });

export const UserQuerySchema = z
  .string({ message: 'Please enter a valid search query.' })
  .trim()
  .min(5, { message: 'Your query is a bit too short. Please use at least 5 characters.' })
  .max(500, { message: 'Your query is a bit too long. Please keep it under 500 characters.' })
  .refine((query) => query.length > 0, {
    message: 'Please describe the chart you would like to create.'
  });

export const ChartDataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

export const GeneratedChartSchema = z
  .object({
    title: z
      .string({ message: 'Chart title is required' })
      .min(1, { message: 'Chart title cannot be empty' })
      .max(200, { message: 'Chart title is too long (max 200 characters)' }),
    description: z
      .string({ message: 'Chart description is required' })
      .min(1, { message: 'Chart description cannot be empty' })
      .max(1000, { message: 'Chart description is too long (max 1000 characters)' }),
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
      .max(2000, { message: 'Too many data points (max 2000 for performance)' })
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
