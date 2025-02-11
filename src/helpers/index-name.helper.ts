export const getIndexName = (
  indexName: string,
  type: string,
  version: string,
): string => {
  const [major] = version.split('.').map((v) => Number(v));
  if (major >= 6) {
    return `${indexName}.${type}`;
  }
  return indexName;
};