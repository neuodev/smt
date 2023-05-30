export const bufferToBigInt = (buf: Buffer) => {
  const hex = buf.toString("hex");
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
};

export function uint8ArrayToBigInt(uint8Array: Uint8Array) {
  return bufferToBigInt(Buffer.from(uint8Array));
}
