export class HarValidator {
  public validate(data: any): { isValid: boolean; errors: any[] } {
    if (!data.log || !data.log.entries || !Array.isArray(data.log.entries)) {
      return { isValid: false, errors: [{ message: "Invalid HAR format: Missing log.entries array." }] };
    }
    return { isValid: true, errors: [] };
  }
}
