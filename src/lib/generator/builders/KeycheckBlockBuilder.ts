import type { CustomAssertion } from '../LoliCodeGenerator';

export class KeycheckBlockBuilder {
  public build(assertion: CustomAssertion): string {
    let block = 'KEYCHECK';
    if(assertion.action !== 'success') {
      block += ` ${assertion.action.toUpperCase()}`;
    }
    
    switch (assertion.type) {
      case 'status':
        return `${block}\n  KEY "<RESPONSE.STATUS>" Equal "${assertion.value}"`;
      case 'contains':
        return `${block}\n  KEY "<RESPONSE.BODY>" Contains "${assertion.value}"`;
      case 'regex':
        return `${block}\n  KEY "<RESPONSE.BODY>" RegexMatch "${assertion.value}"`;
      case 'json-path':
         return `${block}\n  KEY "<RESPONSE.BODY>" JsonPath "${assertion.value}" Equal "${assertion.expectedResult}"`;
      default:
        return '';
    }
  }

  public buildStatusCheck(status: number): string {
    const type = status >= 200 && status < 300 ? 'SUCCESS' : 'FAIL';
    return `KEYCHECK ${type}\n  KEY "<RESPONSE.STATUS>" Equal "${status}"`;
  }
}
