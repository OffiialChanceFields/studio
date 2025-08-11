import { config } from 'dotenv';
config();

// The genkit AI object must be initialized before any flows are loaded.
import '@/ai/genkit.ts';
import '@/ai/flows/summarize-har-insights.ts';
