declare module "circomlibjs" {
  function buildPoseidon(): Promise<(preimage: bigint[]) => Uint8Array>;
}
