import type { Parser, ParseProgress } from './types';

export class SafariWebArchiveParser implements Parser {
  async *parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined> {
    yield { type: 'error', message: 'Safari Web Archive parsing not implemented yet.' };
  }
}
