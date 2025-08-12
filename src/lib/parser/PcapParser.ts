import type { Parser, ParseProgress } from './types';

export class PcapParser implements Parser {
  async *parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined> {
    yield { type: 'error', message: 'PCAP parsing not implemented yet.' };
  }
}
