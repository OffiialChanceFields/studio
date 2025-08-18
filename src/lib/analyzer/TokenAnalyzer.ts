/**
 * @fileoverview Advanced token analysis for HAR entries
 * @module @/lib/analyzer/TokenAnalyzer
 */

import type { SemanticHarEntry } from '@/lib/parser/types';
import type { TokenInfo } from './types';

type TokenOccurrence = {
  entryIndex: number;
  location: 'request' | 'response';
  area: 'header' | 'body' | 'url' | 'cookie';
  // e.g. for a header, this would be the header name
  context: string;
};

interface TrackedToken {
  type: string;
  value: string;
  occurrences: TokenOccurrence[];
  definition: TokenOccurrence | null;
}

/**
 * Analyzes HAR entries to find security tokens, track their flow,
 * and identify dependencies.
 */
export class TokenAnalyzer {
  private readonly tokenPatterns: { type: string; pattern: RegExp; captureGroupIndex: number }[];

  constructor() {
    this.tokenPatterns = [
      { type: 'JWT', pattern: /Bearer\s+([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)/i, captureGroupIndex: 1 },
      { type: 'CSRF', pattern: /["'](csrf_token|xsrf_token|x-csrf-token)["']\s*:\s*["']([^"']+)["']/ig, captureGroupIndex: 2 },
      { type: 'CSRF', pattern: /name=["'](_csrf|csrf-token)["'][^>]*value=["']([^"']+)["']/i, captureGroupIndex: 2 },
      { type: 'SessionID', pattern: /(session_id|sid|jsessionid)=([a-zA-Z0-9\-_]{16,})/ig, captureGroupIndex: 2 },
      { type: 'APIKey', pattern: /["'](api_key|access_token)["']\s*:\s*["']([^"']+)["']/ig, captureGroupIndex: 2 },
      { type: 'APIKey', pattern: /(x-api-key|authorization):\s*([a-zA-Z0-9\-_.]+)/i, captureGroupIndex: 2 },
    ];
  }

  /**
   * Performs a full analysis of tokens in the HAR entries.
   * @param entries - Chronologically ordered HAR entries.
   * @returns An array of detected tokens with their source and usage.
   */
  public analyze(entries: SemanticHarEntry[]): TokenInfo[] {
    const allOccurrences = this.findAllOccurrences(entries);
    const trackedTokens = this.trackTokens(allOccurrences);
    return this.convertToTokenInfo(trackedTokens);
  }

  /**
   * Scans all parts of all entries to find any string that matches a token pattern.
   */
  private findAllOccurrences(entries: SemanticHarEntry[]): Map<string, TrackedToken> {
    const occurrencesMap = new Map<string, TrackedToken>();

    entries.forEach((entry, index) => {
      // Scan Response
      if (entry.response) {
        Object.entries(entry.response.headers).forEach(([name, value]) => this.findInText(occurrencesMap, name + ': ' + value, index, 'response', 'header', name));
        if (entry.response.body?.data) this.findInText(occurrencesMap, entry.response.body.data, index, 'response', 'body', 'body');
      }
      // Scan Request
      if (entry.request) {
        Object.entries(entry.request.headers).forEach(([name, value]) => this.findInText(occurrencesMap, name + ': ' + value, index, 'request', 'header', name));
        if (entry.request.url) this.findInText(occurrencesMap, entry.request.url, index, 'request', 'url', 'url');
        if (entry.request.body?.data) this.findInText(occurrencesMap, entry.request.body.data, index, 'request', 'body', 'body');
      }
    });

    return occurrencesMap;
  }

  private findInText(
    map: Map<string, TrackedToken>,
    text: string,
    entryIndex: number,
    location: 'request' | 'response',
    area: 'header' | 'body' | 'url' | 'cookie',
    context: string
  ) {
    if (!text) return;
    for (const { type, pattern, captureGroupIndex } of this.tokenPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const value = match[captureGroupIndex];
        if (!value || value.length < 10) continue;

        const occurrence: TokenOccurrence = { entryIndex, location, area, context };
        if (map.has(value)) {
          map.get(value)!.occurrences.push(occurrence);
        } else {
          map.set(value, { type, value, occurrences: [occurrence], definition: null });
        }
      }
    }
  }

  /**
   * Identifies the definitive source of each token.
   */
  private trackTokens(tokens: Map<string, TrackedToken>): Map<string, TrackedToken> {
    for (const token of tokens.values()) {
      // The definition is the first time the token appears in a response.
      const definition = token.occurrences.find(o => o.location === 'response');
      if (definition) {
        token.definition = definition;
      }
    }
    return tokens;
  }

  /**
   * Converts the internal `TrackedToken` representation to the `TokenInfo` array.
   */
  private convertToTokenInfo(trackedTokens: Map<string, TrackedToken>): TokenInfo[] {
    const tokenInfos: TokenInfo[] = [];
    for (const token of trackedTokens.values()) {
      if (token.definition) {
        tokenInfos.push({
          type: token.type,
          value: token.value,
          sourceEntry: token.definition.entryIndex,
          sourceLocation: token.definition.area,
        });
      }
    }
    return tokenInfos;
  }
}
