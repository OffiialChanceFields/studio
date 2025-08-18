
import { v4 as uuidv4 } from 'uuid';
import type { SemanticHarEntry, ParseProgress, ParserConfig, Parser } from './types';
import { RequestTransformer } from './transformers/RequestTransformer';
import { ResponseTransformer } from './transformers/ResponseTransformer';
import { HarValidator } from './validators/HarValidator';
import { Queue } from '../utils/Queue';

export class HarStreamingParser implements Parser {
  private worker: Worker;
  private requestTransformer: RequestTransformer;
  private responseTransformer: ResponseTransformer;
  private validator: HarValidator;
  private entriesCount: number = 0;
  private config: Required<ParserConfig>;
  private parseQueue: Queue<() => Promise<void>>;

  constructor(config: ParserConfig = {}) {
    this.config = {
      maxBodySize: config.maxBodySize ?? 1024 * 1024,
      includeResponseBodies: config.includeResponseBodies ?? true,
      validateSchema: config.validateSchema ?? true,
      progressInterval: config.progressInterval ?? 100,
    };
    this.worker = new Worker('/workers/harParser.worker.js');
    this.requestTransformer = new RequestTransformer();
    this.responseTransformer = new ResponseTransformer();
    this.validator = new HarValidator();
    this.parseQueue = new Queue({ concurrency: 4 });
  }

  async *parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined> {
    const reader = file.stream().getReader();
    const totalBytes = file.size;
    let bytesProcessed = 0;

    const workerPromise = new Promise<SemanticHarEntry[]>((resolve, reject) => {
      this.worker.onmessage = (event) => {
        const { type, entries, message } = event.data;
        if (type === 'entries') {
          const semanticEntries = this.transformEntries(entries);
          resolve(semanticEntries);
        } else if (type === 'error') {
          reject(new Error(message));
        }
      };

      this.worker.onerror = (error) => {
        reject(error);
      };
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        this.worker.postMessage({ done: true });
        break;
      }

      if (value) {
        bytesProcessed += value.byteLength;
        await this.parseQueue.add(() => {
            this.worker.postMessage({ chunk: value }, [value.buffer]);
            return Promise.resolve();
        });
      }

      yield {
        type: 'progress',
        percent: (bytesProcessed / totalBytes) * 100,
        entriesParsed: this.entriesCount,
      };
    }

    try {
      const semanticEntries = await workerPromise;
      for (const entry of semanticEntries) {
        yield { type: 'entry', data: entry, entriesParsed: this.entriesCount };
      }
      yield { type: 'done', entriesParsed: this.entriesCount };
    } catch (error: any) {
      yield { type: 'error', message: error.message };
    } finally {
      this.worker.terminate();
    }
  }

  private transformEntries(entries: any[]): SemanticHarEntry[] {
    const semanticEntries: SemanticHarEntry[] = [];
    for (const entry of entries) {
      try {
        const semanticEntry = this.transformEntry(entry);
        semanticEntries.push(semanticEntry);
      } catch (error: any) {
        console.warn(`Skipping entry due to parsing error:`, error.message);
      }
    }
    this.entriesCount = semanticEntries.length;
    return semanticEntries;
  }

  private transformEntry(entry: any): SemanticHarEntry {
    if (this.config.validateSchema) {
      const { error } = this.validator.validate(entry);
      if (error) {
        throw new Error(`Invalid HAR entry schema: ${error.message}`);
      }
    }

    const entryId = uuidv4();
    
    const request = this.requestTransformer.transform(entry.request);
    
    const response = this.responseTransformer.transform(
      entry.response,
      this.config.includeResponseBodies,
      this.config.maxBodySize
    );

    const metadata = {
      pageRef: entry.pageref,
      serverIpAddress: entry.serverIPAddress,
      connection: entry.connection,
      initiatorType: entry._initiator?.type,
      priority: entry._priority,
      resourceType: entry._resourceType
    };

    return {
      entryId,
      timestamp: entry.startedDateTime || new Date().toISOString(),
      duration: entry.time || 0,
      request,
      response,
      metadata
    };
  }
}
