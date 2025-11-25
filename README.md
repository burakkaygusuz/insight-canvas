# InsightCanvas

**InsightCanvas** is a "Talk-to-your-data" visualization tool that runs entirely locally. It allows users to ask natural language questions about a dataset and uses a local LLM (via Ollama) to automatically generate, configure, and render interactive dashboards.

## Features

- **Natural Language Querying:** Ask questions like "Show me sales trends for 2023" or "Compare profit by region."
- **Privacy-First:** Uses **Local LLMs** (Ollama). Your data never leaves your machine.
- **Dynamic Visualization:** Automatically selects the best chart type (Bar, Line, Area, Pie, Scatter) using Recharts.
- **Modern UI:** Built with Next.js 15, Tailwind CSS v4, and Shadcn UI components.
- **Interactive Dashboard:** Grid layout with options to embed or delete charts.

## Architecture

InsightCanvas acts as a client-side orchestrator:

1. **Input:** User provides a text query.
2. **Context Injection:** The app combines the query with the dataset schema and a strict System Prompt.
3. **Local Inference:** The app sends a direct fetch request to your running Ollama instance (`http://localhost:11434`).
4. **JSON Generation:** The LLM returns a structured JSON configuration.
5. **Rendering:** React parses the config and renders the appropriate Recharts component.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI / Shadcn UI (Manual implementation)
- **Visualization:** Recharts
- **AI Backend:** Ollama (Local API)

## Prerequisites

1. **Node.js** (v22 or higher)
2. **Ollama** installed on your machine. [Download here](https://ollama.com).

## Getting Started

### 1. Configure Ollama (Crucial Step)

By default, web browsers block requests to local servers due to CORS. You must start Ollama with the `OLLAMA_ORIGINS` environment variable set to allow browser requests.

**Mac / Linux:**

```bash
OLLAMA_ORIGINS="*" ollama serve
```

**Windows (PowerShell):**

```powershell
$env:OLLAMA_ORIGINS="*"; ollama serve
```

_Ensure you have a model pulled (default is `llama3`):_

```bash
ollama pull llama3
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

You can configure the LLM settings directly within the application by clicking the model name in the top right corner:

- **Base URL:** Default is `http://localhost:11434`
- **Model:** Default is `llama3` (Supports `mistral`, `gemma`, `deepseek-r1`, etc.)

## License

MIT
