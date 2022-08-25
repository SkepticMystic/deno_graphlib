import { DEFAULT_GRAPH_OPTIONS } from "./const.ts";
import { Edge, GraphOptions, IGraph, NodeMeasure, TraversalCallback } from './interfaces.ts';
import { setIntersection, sum } from "./utils.ts";

export class Graph<Node = string> {
    nodes: Set<Node> = new Set();
    adjList: Map<Node, Set<Node>> = new Map();
    options: Required<GraphOptions>

    constructor({ nodes, edges, options }: IGraph<Node>) {
        this.options = Object.assign(DEFAULT_GRAPH_OPTIONS, options ?? {})

        if (nodes) this.addNodes(nodes);
        if (edges) this.addEdges(edges);
    }

    addNode(node: Node) {
        // A set won't add a Node if it already exists,
        // But this return prevents the adjList item from being overwritten
        if (this.hasNode(node)) return this;

        this.nodes.add(node);
        this.adjList.set(node, new Set());

        return this
    }
    addNodes(nodes: Node[] | Set<Node>) {
        for (const node of nodes) this.addNode(node);
        return this
    }

    hasNode(node: Node) {
        return this.nodes.has(node);
    }
    hasNodes(nodes: Node[] | Set<Node>): boolean {
        for (const Node of nodes) if (!this.hasNode(Node)) return false;
        return true;
    }

    removeNode(node: Node) {
        this.nodes.delete(node);
        this.adjList.delete(node);

        for (const [from, toSet] of this.adjList) toSet.delete(node);
        return this
    }

    /** Safely adds the nodes required for the edge to exist */
    private safeAddEdge({ from, to }: Edge<Node>) {
        this.addNodes([from, to]);
        (<Set<Node>>this.adjList.get(from)).add(to);
    }

    addEdge(edge: Edge<Node>, addNodesIfMissing = this.options.addNodesIfMissing) {
        const { from, to } = edge;

        if (this.hasNodes([from, to]) || addNodesIfMissing) this.safeAddEdge(edge)
        else throw new Error(`Node ${from} or ${to} not found`);

        // By now, it's guarenteed both Nodes exist
        if (!this.options.directed) this.safeAddEdge(edge)

        return this
    }

    addEdges(edges: Edge<Node>[] | Set<Edge<Node>>, addNodesIfMissing = this.options.addNodesIfMissing) {
        for (const edge of edges) this.addEdge(edge, addNodesIfMissing);
        return this
    }

    hasEdge(edge: Edge<Node>): boolean {
        const { from, to } = edge;

        if (this.adjList.get(from)?.has(to)) return true
        else return this.options.directed ? false : this.adjList.get(to)?.has(from) ?? false;
    }

    removeEdge(edge: Edge<Node>) {
        const { from, to } = edge;

        this.adjList.get(from)?.delete(to);
        if (!this.options.directed) this.adjList.get(to)?.delete(from);
        return this
    }


    get edges(): Edge<Node>[] {
        const { directed } = this.options;
        const edges = [];

        for (const [from, toSet] of this.adjList) {
            for (const to of toSet) {
                edges.push({ from, to });
                if (!directed) edges.push({ from: to, to: from });
            }
        }
        return edges;
    }

    // Neighbours
    getOutNeighbours(node: Node): Set<Node> {
        return this.adjList.get(node) ?? new Set();
    }

    getInNeighbours(node: Node): Set<Node> {
        const inNeighbours: Set<Node> = new Set();
        for (const [from, toSet] of this.adjList) {
            if (toSet.has(node)) inNeighbours.add(from);
        }
        return inNeighbours;
    }

    getNeighbours(node: Node): Set<Node> {
        return new Set([...this.getOutNeighbours(node), ...this.getInNeighbours(node)]);
    }

    // Algorithms
    dfs(start: Node, callback?: TraversalCallback<Node>): Set<Node> {
        const visited: Set<Node> = new Set();
        const stack = [start];

        let prevNode: Node | undefined;
        while (stack.length) {
            const node = stack.shift() as Node;
            if (visited.has(node)) continue;
            visited.add(node);
            if (callback) callback(node, prevNode);
            stack.push(...this.getOutNeighbours(node));
            prevNode = node;
        }

        return visited;
    }

    bfs(start: Node, callback?: TraversalCallback<Node>): Set<Node> {
        const visited: Set<Node> = new Set();
        const stack = [start];

        let prevNode: Node | undefined;
        while (stack.length) {
            const node = stack.pop() as Node;
            if (visited.has(node)) continue;
            visited.add(node);
            if (callback) callback(node, prevNode);
            stack.push(...this.getOutNeighbours(node));
            prevNode = node;
        }

        return visited;
    }

    private JaccardMeasure(Na: Set<Node>, Nb: Set<Node>) {
        const Nab = setIntersection(Na, Nb)
        const denom = Na.size + Nb.size - Nab.size
        return denom !== 0 ? Nab.size / denom : Infinity
    }

    Jaccard(a: Node, b: Node) {
        const Na = this.getNeighbours(a)
        const Nb = this.getNeighbours(b)
        return this.JaccardMeasure(Na, Nb)
    }

    // Similarity
    JaccardAll(node: Node): NodeMeasure<Node>[] {
        return this.NodeMeasureAll(node, 'Jaccard')
    }

    private OverlapMeasure(Na: Set<Node>, Nb: Set<Node>) {
        const Nab = setIntersection(Na, Nb)
        return Na.size !== 0 && Nb.size !== 0
            ? Nab.size ** 2 / Math.min(Na.size, Nb.size)
            : Infinity
    }

    Overlap(a: Node, b: Node) {
        const Na = this.getNeighbours(a)
        const Nb = this.getNeighbours(b)
        return this.OverlapMeasure(Na, Nb)
    }

    OverlapAll(node: Node): NodeMeasure<Node>[] {
        return this.NodeMeasureAll(node, 'Overall')
    }

    private AdamicAdarMeasure(Na: Set<Node>, Nb: Set<Node>) {
        const Nab = setIntersection(Na, Nb)

        let measure = Infinity
        if (Nab.size) {
            const outDegreeInverses: number[] = [...Nab].map((n) => {
                const { size } = this.getOutNeighbours(n)
                return 1 / Math.log(size)
            })

            measure = sum(outDegreeInverses)
        }
        return measure
    }

    AdamicAdar(a: Node, b: Node) {
        const Na = this.getNeighbours(a)
        const Nb = this.getNeighbours(b)
        return this.AdamicAdarMeasure(Na, Nb)
    }

    AdamicAdarAll(node: Node): NodeMeasure<Node>[] {
        return this.NodeMeasureAll(node, 'AdamicAdar')
    }

    private NodeMeasureAll(node: Node, measureName: 'Jaccard' | 'Overall' | 'AdamicAdar'): NodeMeasure<Node>[] {
        const results: NodeMeasure<Node>[] = []
        const Na = this.getNeighbours(node)

        this.nodes.forEach((to) => {
            const Nb = this.getNeighbours(to)
            let measure: number
            switch (measureName) {
                case 'Jaccard': measure = this.JaccardMeasure(Na, Nb); break;
                case 'Overall': measure = this.OverlapMeasure(Na, Nb); break;
                case 'AdamicAdar': measure = this.AdamicAdarMeasure(Na, Nb); break;
            }

            results.push({ node: to, measure })
        })
        return results
    }
}