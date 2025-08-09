import type { SemanticHarEntry, ResponseContentType } from '../types';

export class ResponseTransformer {
  public transform(response: any, includeBody: boolean, maxBodySize: number): SemanticHarEntry['response'] {
    if (!response) throw new Error("Response object is missing.");

    const headers: Record<string, string> = {};
    (response.headers || []).forEach((h: { name: string; value: string }) => {
        headers[h.name.toLowerCase()] = h.value;
    });

    const cookies: Record<string, string> = {};
    (response.cookies || []).forEach((c: { name: string; value: string }) => {
      cookies[c.name] = c.value;
    });

    let bodyData = response.content?.text || '';
    const truncated = bodyData.length > maxBodySize;
    if (truncated) {
      bodyData = bodyData.substring(0, maxBodySize);
    }

    const getContentType = (mimeType: string): ResponseContentType => {
      if (mimeType.includes('json')) return 'json';
      if (mimeType.includes('html')) return 'html';
      if (mimeType.includes('xml')) return 'xml';
      if (mimeType.startsWith('text')) return 'text';
      return 'binary';
    };
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      cookies,
      redirectUrl: response.redirectURL || undefined,
      body: (includeBody && response.content) ? {
        contentType: getContentType(response.content.mimeType || ''),
        data: bodyData,
        size: response.content.size > -1 ? response.content.size : 0,
        truncated,
      } : undefined
    };
  }
}
