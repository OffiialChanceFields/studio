export class StringOperators {
  static contains(source: string, value: string, caseSensitive: boolean): boolean {
    const s = caseSensitive ? source : source.toLowerCase();
    const v = caseSensitive ? value : value.toLowerCase();
    return s.includes(v);
  }

  static equals(source: string, value: string, caseSensitive: boolean): boolean {
    if (caseSensitive) {
      return source === value;
    }
    return source.toLowerCase() === value.toLowerCase();
  }

  static startsWith(source: string, value: string, caseSensitive: boolean): boolean {
    const s = caseSensitive ? source : source.toLowerCase();
    const v = caseSensitive ? value : value.toLowerCase();
    return s.startsWith(v);
  }

  static endsWith(source: string, value: string, caseSensitive: boolean): boolean {
    const s = caseSensitive ? source : source.toLowerCase();
    const v = caseSensitive ? value : value.toLowerCase();
    return s.endsWith(v);
  }
}
