export interface IField {
  fieldName: string;
  type: 'text' | 'keyword' | 'double' | 'long' | 'boolean' | 'date';
  index?: boolean;
  defaultValue?: any;
}