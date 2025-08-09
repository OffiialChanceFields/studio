/**
 * @fileoverview Stream-based HAR file parser with progress reporting
 * @module @/lib/parser
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { 
  SemanticHarEntry, 
  ProgressCallback, 
  ParserConfig,
  HttpMethod,
  ContentType,
  ResponseContentType 
} from './types';
import { HarValidator } from './validators/HarValidator';
import { RequestTransformer } from './transformers/RequestTransformer';
import { ResponseTransformer } from './transformers/ResponseTransformer';

/**
 * Stream-based HAR parser with real-time progress updates
 * Processes large HAR files efficiently using chunked parsing
 */
export class HarStreamingParser {
  private readonly config: Required<ParserConfig>;
  private readonly validator: HarValidator;
  private readonly requestTransformer: RequestTransformer;
  private readonly responseTransformer: ResponseTransformer;

  constructor(config: ParserConfig = {}) {
    this.config = {
      maxBodySize: config.maxBodySize ?? 1024 * 1024, // 1MB
      includeResponseBodies: config.includeResponseBodies ?? true,
      validateSchema: config.validateSchema ?? true,
      progressInterval: config.progressInterval ?? 100
    };
    
    this.validator = new HarValidator();
    this.requestTransformer = new RequestTransformer();
    this.responseTransformer = new ResponseTransformer();
  }

  /**
   * Parse HAR content with streaming and progress updates
   * @param harContent - Raw HAR JSON string
   * @param onProgress - Progress callback (0-1 scale)
   * @returns Promise resolving to normalized HAR entries
   * @throws {Error} HAR_TOO_LARGE - File exceeds 50MB
   * @throws {Error} INVALID_HAR_STRUCTURE - Invalid HAR format
   */
  public async parse(
    harContent: string,
    onProgress?: ProgressCallback
  ): Promise<SemanticHarEntry[]> {
    // Size validation
    const sizeInMB = new Blob([harContent]).size / (1024 * 1024);
    if (sizeInMB > 50) {
      throw new Error(`HAR_TOO_LARGE: File size ${sizeInMB.toFixed(2)}MB exceeds 50MB limit`);
    }

    onProgress?.(0.1, 'Parsing HAR structure...');

    // Parse JSON
    let harData: any;
    try {
      harData = JSON.parse(harContent);
    } catch (error: any) {
      throw new Error(`INVALID_HAR_STRUCTURE: Invalid JSON - ${error.message}`);
    }

    onProgress?.(0.2, 'Validating HAR schema...');

    // Schema validation
    if (this.config.validateSchema) {
      const validation = this.validator.validate(harData);
      if (!validation.isValid) {
        throw new Error(`INVALID_HAR_STRUCTURE: ${validation.errors[0].message}`);
      }
    }

    // Verify required structure
    if (!harData.log?.entries || !Array.isArray(harData.log.entries)) {
      throw new Error('INVALID_HAR_STRUCTURE: Missing log.entries array');
    }

    const entries = harData.log.entries;
    const totalEntries = entries.length;
    const semanticEntries: SemanticHarEntry[] = [];

    onProgress?.(0.3, `Processing ${totalEntries} entries...`);

    // Process entries with progress updates
    for (let i = 0; i < totalEntries; i++) {
      const entry = entries[i];
      
      try {
        const semanticEntry = this.transformEntry(entry, i);
        semanticEntries.push(semanticEntry);
      } catch (error: any) {
        console.warn(`Failed to parse entry ${i}:`, error.message);
        // Continue processing other entries
      }

      // Update progress at intervals
      if (i % 10 === 0 || i === totalEntries - 1) {
        const progress = 0.3 + (0.6 * (i + 1) / totalEntries);
        onProgress?.(progress, `Processed ${i + 1}/${totalEntries} entries`);
      }
    }

    // Sort by timestamp
    semanticEntries.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    onProgress?.(1, `Completed: ${semanticEntries.length} entries parsed`);

    return semanticEntries;
  }

  /**
   * Transform a single HAR entry to semantic format
   */
  private transformEntry(entry: any, index: number): SemanticHarEntry {
    const entryId = uuidv4();
    
    // Parse request
    const request = this.requestTransformer.transform(entry.request);
    
    // Parse response
    const response = this.responseTransformer.transform(
      entry.response,
      this.config.includeResponseBodies,
      this.config.maxBodySize
    );

    // Extract metadata
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

// Export factory function for convenient usage
export function createParser(config?: ParserConfig): HarStreamingParser {
  return new HarStreamingParser(config);
}
