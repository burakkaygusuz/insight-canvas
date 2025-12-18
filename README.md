# InsightCanvas

**InsightCanvas** is a modern, privacy-focused "Talk-to-your-data" visualization tool. It transforms your raw CSV or Excel files into interactive, insightful dashboards using the power of AI.

Built with **Next.js 16**, **Tailwind CSS v4**, and **Framer Motion**, it offers a premium, glassmorphic user experience where your data never leaves your browser unless you choose a cloud provider.

## ✨ Features

- **Bring Your Own Key (BYOK):** Support for **Google Gemini**, **OpenAI**, and local LLMs (via **Ollama** / OpenAI Compatible endpoints). Your API keys are stored locally in your browser.
- **Data Ingestion:** Drag & drop support for **CSV** and **Excel (.xlsx)** files.
- **Natural Language Analysis:** Ask questions like _"Compare monthly revenue growth"_ or _"Show me the distribution of customers by region."_
- **Smart Visualization:** Automatically selects the optimal chart type (Area, Bar, Line, Pie) based on your data and query.
- **Modern UX:**
  - **Glassmorphism Design:** Sleek, translucent UI with "Deep Obsidian" dark mode.
  - **Bento Grid Layout:** Responsive, dynamic dashboard that adapts to your screen.
  - **Cinematic Interactions:** Granular loading states and smooth transitions.
- **Privacy First:** Data processing happens in your browser. When using cloud AI, only the necessary data schema and samples are sent for chart generation logic.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **Animation:** Framer Motion
- **Visualization:** Recharts
- **Data Parsing:** PapaParse / XLSX
- **UI Components:** Radix UI primitives with custom glassmorphic styling

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** (v20 or higher)
- **pnpm** (recommended) or npm/yarn

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/burakkaygusuz/insight-canvas.git
cd insight-canvas
pnpm install
```

### 3. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 AI Configuration

InsightCanvas supports multiple AI providers. You can configure them directly in the UI:

### Google Gemini (Recommended)

- Get your free API key from [Google AI Studio](https://aistudio.google.com/).
- Select "Google Gemini" in settings and paste your key.

### OpenAI

- Use your existing OpenAI API key.
- Supports models like `gpt-5.2`, `gpt-5.1-mini`, etc.

### Local LLMs (Ollama / LM Studio)

To use local models, select **"OpenAI Compatible"** provider.

1. **Start Ollama** (Important: Enable CORS):

   ```bash
   # Mac / Linux
   OLLAMA_ORIGINS="*" ollama serve

   # Windows (PowerShell)
   $env:OLLAMA_ORIGINS="*"; ollama serve
   ```

2. **Configure in App:**
   - **Base URL:** `http://localhost:11434/v1`
   - **Model:** `llama3`, `mistral`, `deepseek-r1`, etc. (Make sure you pulled the model via `ollama pull <model>`)

## 📝 Usage

1. **Connect:** Enter your API key (stored locally).
2. **Upload:** Drop your CSV or Excel file.
3. **Chat:** Ask questions about your data.
   - _"Show me sales over time"_
   - _"What is the top performing product?"_
4. **Dashboard:** View, organize, and manage your generated charts in the Bento Grid.

## 📄 License

MIT © [Burak Kaygusuz](https://github.com/burakkaygusuz)
