import type { SemanticHarEntry } from '../types';

export class RequestTransformer {
  public transform(request: any): SemanticHarEntry['request'] {
    if (!request) throw new Error("Request object is missing.");
    
    const url = new URL(request.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const headers: Record<string, string> = {};
    (request.headers || []).forEach((h: { name: string; value: string }) => {
        headers[h.name.toLowerCase()] = h.value;
    });

    const cookies: Record<string, string> = {};
    (request.cookies || []).forEach((c: { name: string; value: string }) => {
      cookies[c.name] = c.value;
    });

    return {
      method: request.method,
      url: request.url,
      headers,
      cookies,
      queryParams,
      body: request.postData ? {
        contentType: (request.postData.mimeType.includes('json') ? 'json' : 'form') as 'json' | 'form',
        data: request.postData.text || '',
        size: request.bodySize,
      } : undefined
    };
  }
}
