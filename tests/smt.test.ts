import { SMT } from "../src/smt";
import { buildPoseidon } from "circomlibjs";
import { uint8ArrayToBigInt } from "../src/utils";

describe("SMT", () => {
  it("should generate a tree", async () => {
    const poseidon = await buildPoseidon();
    const hash = (nodes: bigint[]) => uint8ArrayToBigInt(poseidon(nodes));
    const leaves = [1, 2, 3, 4].map((leaf) => hash([BigInt(leaf)]));

    const zeroValue = BigInt(0);
    const zeroValueHash = hash([zeroValue]);
    const depth = 3;
    const tree = await new SMT(leaves, depth, zeroValue).setup();

    const l1 = [
      ...leaves,
      zeroValueHash,
      zeroValueHash,
      zeroValueHash,
      zeroValueHash,
    ];
    const l2 = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ].map(([first, second]) => hash([l1[first], l1[second]]));

    const l3 = [
      [0, 1],
      [2, 3],
    ].map(([first, second]) => hash([l2[first], l2[second]]));

    const l4 = [hash([l3[0], l3[1]])];

    const root = tree.getRoot();
    expect(root).toBe(l4[0]);
  });
});
