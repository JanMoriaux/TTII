export const toStringWithDecimals = (n, d) => {
  
  return n.toLocaleString(undefined, { minimumFractionDigits: d });
};
