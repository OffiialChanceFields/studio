import type { VariableExtraction } from '../LoliCodeGenerator';

export class ParseBlockBuilder {
  public build(extraction: VariableExtraction): string {
    const isGlobal = extraction.isGlobal ? 'true' : 'false';
    const varName = `"${extraction.variableName}"`;
    const pattern = `"${extraction.pattern}"`;

    switch (extraction.type) {
      case 'regex':
        return `PARSE "<RESPONSE.BODY>" REGEX ${pattern} -> VAR ${varName} ${isGlobal}`;
      case 'json':
        return `PARSE "<RESPONSE.BODY>" JSON ${pattern} -> VAR ${varName} ${isGlobal}`;
      case 'css':
        return `PARSE "<RESPONSE.BODY>" CSS ${pattern} -> VAR ${varName} ${isGlobal}`;
      case 'xpath':
        return `PARSE "<RESPONSE.BODY>" XPATH ${pattern} -> VAR ${varName} ${isGlobal}`;
      default:
        return '';
    }
  }
}
