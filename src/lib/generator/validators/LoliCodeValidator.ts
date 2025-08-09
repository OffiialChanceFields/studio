export class LoliCodeValidator {
  public validate(script: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!script.trim()) {
      errors.push('Script is empty.');
    }
    if (script.includes('undefined')) {
      errors.push('Script contains "undefined" values.');
    }
    // A real validator would have a full parser. This is a basic check.
    return { isValid: errors.length === 0, errors };
  }
}
