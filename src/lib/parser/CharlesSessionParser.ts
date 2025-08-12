import type { Parser, ParseProgress } from './types';

export class CharlesSessionParser implements Parser {
  async *parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined> {
    yield { type: 'error', message: 'Charles Session parsing not implemented yet.' };
  }
}
