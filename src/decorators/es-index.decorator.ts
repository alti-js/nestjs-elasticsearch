import { IField } from '../models/dtos/field.dto';
export const ElasticIndex = (type: string): any => {
  function decorator(constructor: any) {
    constructor.prototype.__type = type;
  }
  return decorator;
};

export function ElasticColumn(config: Partial<IField>) {
  return function (target: any, key: string): void {
    if (!target.constructor.prototype.__fields) {
      target.constructor.prototype.__fields = {};
    }
    target.constructor.prototype.__fields[key] = { fieldName: key, ...config };
  };
}