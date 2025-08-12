import type { Parser, ParseProgress } from './types';

export class AutoDetectParser implements Parser {
  async *parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined> {
    yield { type: 'error', message: 'Auto-detection of file format not implemented yet.' };
  }
}
