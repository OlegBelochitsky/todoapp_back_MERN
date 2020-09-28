import toAdjacencyList from "../util/toAdjacencyList.js";
import testData from "./testData.json";

describe("Testing toAdjacencyList conversions", () => {
  it("can convert graph with single node", async () => {
    const graph = { data: 1 };
    const {
      numberToNode,
      nodeToNumber,
      inVertices,
      outVertices,
    } = await toAdjacencyList(graph, "sons");
    expect(numberToNode.get(0)).toBe(graph);
    expect(nodeToNumber.get(graph)).toBe(0);
    expect(inVertices).toBe([[]]);
    expect(outVertices).toBe([[]]);
  });

  it("can convert graph with many nodes", async () => {
    const {
      numberToNode,
      nodeToNumber,
      inVertices,
      outVertices,
    } = await toAdjacencyList(testData.graph, "sons");

    expect(numberToNode.size).toBe(5);
    expect(nodeToNumber.size).toBe(5);

    for (let i = 0; i < 5; i++) {
      expect(nodeToNumber.get(numberToNode.get(i))).toBe(i);
    }

    expect(inVertices).toBe([[], [0], [0], [2], [2]]);
    expect(outVertices).toBe([[1, 2], [], [3, 4], [], []]);
  });
});
