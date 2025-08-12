import { HarStreamingParser } from './HarStreamingParser';
import { PcapParser } from './PcapParser';
import { SafariWebArchiveParser } from './SafariWebArchiveParser';
import { CharlesSessionParser } from './CharlesSessionParser';
import { AutoDetectParser } from './AutoDetectParser';
import type { Parser } from './types';

export class ParserFactory {
  static createParser(file: File, config?: any): Parser {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'har':
        return new HarStreamingParser(config);
      case 'pcap':
      case 'pcapng':
        return new PcapParser();
      case 'webarchive':
        return new SafariWebArchiveParser();
      case 'chlsj':
        return new CharlesSessionParser();
      default:
        return new AutoDetectParser();
    }
  }
}
