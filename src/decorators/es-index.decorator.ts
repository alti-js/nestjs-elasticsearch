import { IField } from '../models/dtos/field.dto';

// Type for constructor function
type Constructor = new (...args: unknown[]) => Record<string, unknown>;

// Type for decorator function
type ClassDecorator = (constructor: Constructor) => void;

export const ElasticIndex = (type: string): ClassDecorator => {
  function decorator(constructor: Constructor): void {
    (constructor.prototype as Record<string, unknown>).__type = type;
  }
  return decorator;
};

export function ElasticColumn(config: Partial<IField>) {
  return function (target: Record<string, unknown>, key: string): void {
    const prototype = (target.constructor as Constructor).prototype as Record<string, unknown>;
    if (!prototype.__fields) {
      prototype.__fields = {};
    }
    (prototype.__fields as Record<string, unknown>)[key] = { fieldName: key, ...config };
  };
}