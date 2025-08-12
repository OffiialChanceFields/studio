/**
 * @fileoverview Core type definitions for HAR parsing module
 * @module @/lib/parser
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type ContentType = 'form' | 'json' | 'text' | 'xml' | 'binary';
export type ResponseContentType = 'html' | 'json' | 'text' | 'xml' | 'binary';

/**
 * Normalized HAR entry with semantic properties
 * All headers are lowercase for consistent access
 */
export interface SemanticHarEntry {
  /** Unique identifier for this entry */
  entryId: string;
  
  /** ISO 8601 timestamp of request initiation */
  timestamp: string;
  
  /** Request duration in milliseconds */
  duration: number;
  
  /** Semantic request properties */
  request: {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>; // All keys lowercase
    cookies: Record<string, string>;
    queryParams: Record<string, string>;
    body?: {
      contentType: ContentType;
      data: string;
      size: number;
    };
  };
  
  /** Semantic response properties */
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>; // All keys lowercase
    cookies: Record<string, string>;
    body?: {
      contentType: ResponseContentType;
      data: string;
      size: number;
      truncated: boolean;
    };
    redirectUrl?: string;
  };
  
  /** Analysis metadata */
  metadata: {
    pageRef?: string;
    serverIpAddress?: string;
    connection?: string;
    initiatorType?: 'parser' | 'script' | 'preload' | 'other';
    priority?: 'VeryHigh' | 'High' | 'Medium' | 'Low';
    resourceType?: string;
  };
}

/**
 * Progress callback for streaming operations
 */
export type ProgressCallback = (progress: number, message?: string) => void;

/**
 * Parser configuration options
 */
export interface ParserConfig {
  maxBodySize?: number;        // Default: 1MB
  includeResponseBodies?: boolean; // Default: true
  validateSchema?: boolean;    // Default: true
  progressInterval?: number;   // Default: 100ms
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export type ParseProgress =
  | { type: 'progress'; percent: number, entriesParsed: number }
  | { type: 'result'; entries: SemanticHarEntry[] }
  | { type: 'error'; message: string };

export interface Parser {
  parseWithProgress(file: File): AsyncGenerator<ParseProgress, any, undefined>;
}
