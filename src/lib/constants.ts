export const MOCK_DATASET = [
  {
    date: '2023-01-01',
    region: 'North America',
    product: 'SaaS Subscription',
    sales: 12000,
    profit: 4000,
    customers: 150
  },
  {
    date: '2023-01-02',
    region: 'North America',
    product: 'Enterprise License',
    sales: 25000,
    profit: 10000,
    customers: 20
  },
  {
    date: '2023-01-03',
    region: 'Europe',
    product: 'SaaS Subscription',
    sales: 8000,
    profit: 2500,
    customers: 100
  },
  {
    date: '2023-01-04',
    region: 'Asia',
    product: 'Consulting',
    sales: 5000,
    profit: 1500,
    customers: 5
  },
  {
    date: '2023-01-05',
    region: 'North America',
    product: 'SaaS Subscription',
    sales: 14000,
    profit: 4500,
    customers: 160
  },
  {
    date: '2023-02-01',
    region: 'Europe',
    product: 'Enterprise License',
    sales: 22000,
    profit: 9000,
    customers: 18
  },
  {
    date: '2023-02-15',
    region: 'Asia',
    product: 'SaaS Subscription',
    sales: 9500,
    profit: 3000,
    customers: 110
  },
  {
    date: '2023-03-01',
    region: 'North America',
    product: 'Consulting',
    sales: 7000,
    profit: 2000,
    customers: 8
  },
  {
    date: '2023-03-10',
    region: 'Europe',
    product: 'SaaS Subscription',
    sales: 11000,
    profit: 3500,
    customers: 130
  },
  {
    date: '2023-04-01',
    region: 'Asia',
    product: 'Enterprise License',
    sales: 18000,
    profit: 7500,
    customers: 15
  },
  {
    date: '2023-04-15',
    region: 'North America',
    product: 'SaaS Subscription',
    sales: 16000,
    profit: 5500,
    customers: 180
  },
  {
    date: '2023-05-01',
    region: 'Europe',
    product: 'Consulting',
    sales: 6000,
    profit: 1800,
    customers: 6
  },
  {
    date: '2023-05-20',
    region: 'Asia',
    product: 'SaaS Subscription',
    sales: 10500,
    profit: 3200,
    customers: 125
  },
  {
    date: '2023-06-01',
    region: 'North America',
    product: 'Enterprise License',
    sales: 28000,
    profit: 12000,
    customers: 25
  },
  {
    date: '2023-06-15',
    region: 'Europe',
    product: 'SaaS Subscription',
    sales: 13000,
    profit: 4200,
    customers: 145
  }
];

export const MOCK_SCHEMA = `
Dataset Schema:
- date: string (YYYY-MM-DD)
- region: string (North America, Europe, Asia)
- product: string (SaaS Subscription, Enterprise License, Consulting)
- sales: number (Revenue in USD)
- profit: number (Profit in USD)
- customers: number (Count of customers)
`;

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

export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-tooltip)'
  },
  itemStyle: { color: 'var(--foreground)' }
} as const;

export enum AiProvider {
  GOOGLE = 'GOOGLE',
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE'
}

export const DEFAULT_MODELS = {
  [AiProvider.GOOGLE]: 'gemini-2.5-flash',
  [AiProvider.OPENAI]: 'gpt-4o',
  [AiProvider.OPENAI_COMPATIBLE]: 'llama-3.1-70b'
};

export const POPULAR_MODELS = {
  [AiProvider.GOOGLE]: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  [AiProvider.OPENAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  [AiProvider.OPENAI_COMPATIBLE]: ['llama-3.1-70b', 'mixtral-8x7b', 'qwen-2.5-72b']
};

export const PROVIDER_LABELS = {
  [AiProvider.GOOGLE]: 'Google Gemini',
  [AiProvider.OPENAI]: 'OpenAI',
  [AiProvider.OPENAI_COMPATIBLE]: 'OpenAI Compatible'
};
