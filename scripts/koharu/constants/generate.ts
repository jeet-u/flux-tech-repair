export type GenerateType = 'lqips' | 'similarities' | 'summaries';

export interface GenerateItem {
  id: GenerateType;
  label: string;
  description: string;
  duration: 'fast' | 'medium' | 'slow';
  script: string;
  requiresLlm?: boolean;
}

export const GENERATE_ITEMS: GenerateItem[] = [
  {
    id: 'lqips',
    label: 'LQIP Image Placeholder',
    description: 'Fast - Generate low quality image placeholder',
    duration: 'fast',
    script: 'src/scripts/generateLqips.ts', // TODO: Refactor to root scripts directory
  },
  {
    id: 'similarities',
    label: 'Similarity Vectors',
    description: 'Medium - Generate semantic similarity vectors (First time requires downloading model and caching)',
    duration: 'medium',
    script: 'src/scripts/generateSimilarities.ts', // TODO: Refactor to root scripts directory
  },
  {
    id: 'summaries',
    label: 'AI Summary',
    description: 'Requires LLM - Generate AI article summary',
    duration: 'slow',
    script: 'src/scripts/generateSummaries.ts', // TODO: Refactor to root scripts directory
    requiresLlm: true,
  },
];

export const DEFAULT_LLM_MODEL = 'qwen/qwen3-4b-2507';
export const LLM_API_URL = 'http://127.0.0.1:1234/v1/';
