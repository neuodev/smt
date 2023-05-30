import { buildPoseidon } from "circomlibjs";
import { uint8ArrayToBigInt } from "./utils";

export class SMT {
  zeroValue: bigint;
  depth: number;
  private leaves: bigint[];
  private defaultHashes: bigint[] = [];
  private hash: ((values: bigint[]) => bigint) | null = null;
  private layers: bigint[][] = [];

  constructor(leaves: bigint[], depth: number, zeroValue: bigint = BigInt(0)) {
    this.leaves = leaves;
    this.zeroValue = zeroValue;
    this.depth = depth;
  }

  public async setup(): Promise<SMT> {
    const poseidon = await buildPoseidon();
    this.hash = (values: bigint[]): bigint =>
      uint8ArrayToBigInt(poseidon(values));
    this.defaultHashes = this.computeDefaultHashes();
    this.layers = this.processLeaves();
    return this;
  }

  private computeDefaultHashes() {
    if (!this.hash)
      throw new Error("Missing hash function, call smt.setup() first!");

    const zeroValue = this.hash([this.zeroValue]);
    const defaultHashes = [zeroValue];

    for (let layer = 1; layer <= this.depth; layer++) {
      defaultHashes.push(
        this.hash([defaultHashes[layer - 1], defaultHashes[layer - 1]])
      );
    }

    return defaultHashes;
  }

  private processLeaves(): bigint[][] {
    if (!this.hash)
      throw new Error("Missing hash function, call smt.setup() first!");

    const layers: bigint[][] = [this.leaves];
    for (let layer = 1; layer <= this.depth; layer++) {
      const prevLayer = layers[layer - 1];
      const nextLayer = [];

      for (let leaf = 0; leaf < prevLayer.length; leaf += 2) {
        const currentLeaf = prevLayer[leaf];
        const nextLeaf = prevLayer[leaf + 1] || this.defaultHashes[layer - 1];
        nextLayer.push(this.hash([currentLeaf, nextLeaf]));
      }

      layers.push(nextLayer);
    }

    return layers;
  }

  public getRoot(): bigint {
    return this.layers[this.layers.length - 1][0];
  }
}
