// Unique transaction id, e.g. TXN-261104-9F3A1C0B (doc id => create-only rule guarantees uniqueness)
export const txnId = () => {
  const d = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `TXN-${d}-${Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};
