/**
 * @fileoverview This file initializes the Genkit AI instance with the necessary plugins.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
});
