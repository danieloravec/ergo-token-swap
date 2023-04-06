export const decimalize = (x: number | bigint, decimals: number): number => {
  return Number(x) / Math.pow(10, decimals);
};

export const shortenString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) {
    return str;
  }
  const prefSufLength = Math.floor((maxLength - 3) / 2);
  return (
    str.substring(0, prefSufLength) +
    '...' +
    str.substring(str.length - prefSufLength, str.length)
  );
};
