# Deno Graphlib

Deno Graphlib provides a simple API for creating, manipulating, and analysing graphs.

## Usage

```ts
import { Graph } from "https://deno.land/x/deno_graphlib/src/index.ts";

const g = new Graph({
  nodes: ["a", "b", "c"],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
    { from: "c", to: "a" },
  ],
});
```

## Nodes

Using the [equal](https://deno.land/x/equal@v1.5.0) package, nodes can be arbitrary objects.

```ts
const g = new Graph();
g.addNodes([
  { id: 1, name: "a" },
  { id: 2, name: "b" },
  { id: 3, name: "c" },
]);

g.addEdges([
  { from: { id: 1, name: "a" }, to: { id: 2, name: "b" } },
  { from: { id: 2, name: "b" }, to: { id: 3, name: "c" } },
  { from: { id: 3, name: "c" }, to: { id: 1, name: "a" } },
]);
```

Internally, nodes are assigned a random id to identify them.
If you need to find a node's id from the node object, use `graph.findNodeId(node)`.

## Edges

Edges are stored in an adjacency list, which can be accessed under `graph.adjList`.

```ts
const g = new Graph();
g.addNodes(["a", "b", "c"]);
g.addEdges([
  { from: "a", to: "b" },
  { from: "b", to: "c" },
  { from: "c", to: "a" },
]);

console.log(g.adjList);
// Map {
//   "s60Ht_zC5e" => Set { "WTLUqFOfo_" },
//   "WTLUqFOfo_" => Set { "nVtjFkidb8" },
//   "nVtjFkidb8" => Set { "s60Ht_zC5e" }
// }
```

The adjacency list uses node ids, so you may need to map that id to the corresponding node object, using the `graph.nodes: Map<Id, Node>` map.
