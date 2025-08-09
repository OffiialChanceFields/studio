export class NumericOperators {
  static greaterThan(source: number, value: number): boolean {
    return source > value;
  }

  static lessThan(source: number, value: number): boolean {
    return source < value;
  }

  static inRange(source: number, min: number, max: number): boolean {
    return source >= min && source <= max;
  }
}
