const { buildPoseidon } = require("circomlibjs");

const bufferToBigInt = (buf: Buffer) => {
  const hex = buf.toString("hex");
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
};

function uint8ArrayToBigInt(uint8Array: Uint8Array) {
  return bufferToBigInt(Buffer.from(uint8Array));
}

async function main() {
  const poseidon = await buildPoseidon();
  const hash = (nodes: bigint[]) => uint8ArrayToBigInt(poseidon(nodes));
  const leaves = [1, 2, 3, 4].map((leaf) => hash([BigInt(leaf)]));

  const zeroValue = hash([BigInt(0)]);
  const defaultHashes = [zeroValue];
  const depth = 3; // constant

  for (let height = 0; height < depth; height++) {
    defaultHashes.push(hash([defaultHashes[height], defaultHashes[height]]));
  }

  console.log({ defaultHashes });

  const layers = [leaves];
  for (let layer = 1; layer <= depth; layer++) {
    const prevLayer = layers[layer - 1];
    const nextLayer = [];

    for (let leaf = 0; leaf < prevLayer.length; leaf += 2) {
      const currentLeaf = prevLayer[leaf];
      const nextLeaf = prevLayer[leaf + 1] || defaultHashes[layer - 1];
      nextLayer.push(hash([currentLeaf, nextLeaf]));
    }

    layers.push(nextLayer);
  }

  console.log({ layers });

  // Manually constructing the tree
  const l1 = [...leaves, zeroValue, zeroValue, zeroValue, zeroValue];
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

  console.log({
    tree: [l1, l2, l3, l4],
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log("err: ", err);
    process.exit(1);
  });

// addLeaf()
// removeLeaf()
// updateLeaf()
// getLeaf()
