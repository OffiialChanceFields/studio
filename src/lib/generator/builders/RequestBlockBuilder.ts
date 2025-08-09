import type { SemanticHarEntry } from '@/lib/parser/types';
import type { CustomHeader } from '../LoliCodeGenerator';

export class RequestBlockBuilder {
  public build(entry: SemanticHarEntry, customHeaders?: CustomHeader[]): string {
    const lines: string[] = [];
    const { request } = entry;

    let content = `"${request.url}"`;
    if (request.method !== 'GET') {
      content += ` ${request.method}`;
    }
    lines.push(`REQUEST ${content}`);

    lines.push('  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"');

    const headers = { ...request.headers };
    if (customHeaders) {
      customHeaders.forEach(h => {
        if (h.enabled) headers[h.key.toLowerCase()] = h.value;
      });
    }

    for (const [key, value] of Object.entries(headers)) {
      if (['user-agent', 'cookie', 'content-length'].includes(key.toLowerCase())) continue;
      lines.push(`  "${key}: ${value}"`);
    }

    if (Object.keys(request.cookies).length > 0) {
      const cookieString = Object.entries(request.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
      lines.push(`  "Cookie: ${cookieString}"`);
    }

    if (request.body) {
      const body = request.body.data.replace(/"/g, '\\"');
      lines.push(`  CONTENT "${body}"`);
      lines.push(`  "Content-Type: ${request.body.contentType === 'json' ? 'application/json' : 'application/x-www-form-urlencoded'}"`);
    }

    return lines.join('\n');
  }
}
