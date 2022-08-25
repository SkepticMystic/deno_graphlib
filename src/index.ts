import { DEFAULT_GRAPH_OPTIONS } from "./const.ts";
import { Edge, GraphOptions, IGraph } from './interfaces.ts';

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
}