import { promises as fs } from 'node:fs';
import path from 'node:path';

import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const promptPath = path.join(process.cwd(), 'src/prompts/system.md');
  const systemPromptTemplate = await fs.readFile(promptPath, 'utf8');

  return <Dashboard systemPromptTemplate={systemPromptTemplate} />;
}
