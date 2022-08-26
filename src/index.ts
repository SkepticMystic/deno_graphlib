import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import { equal } from "https://deno.land/x/equal@v1.5.0/mod.ts";
import { DEFAULT_GRAPH_OPTIONS } from "./const.ts";
import { Edge, GraphOptions, Id, IGraph, Label, NodeMeasure, TraversalCallback } from './interfaces.ts';
import { setIntersection, sum } from "./utils.ts";

export class Graph<Node> {
    nodes: Map<Id, Node> = new Map();
    adjList: Map<Id, Set<Id>> = new Map();
    options: Required<GraphOptions>

    constructor(setup?: IGraph<Node>) {
        const { edges, nodes, options } = setup ?? {};

        this.options = Object.assign(DEFAULT_GRAPH_OPTIONS, options ?? {})

        if (nodes) this.addNodes(nodes);
        if (edges) this.addEdges(edges);
    }

    private newNodeId() {
        return nanoid(this.options.nodeIdLength)
    }

    /** Finds a node using deep equal, and returns its id, if it exists */
    findNodeId(node: Node) {
        for (const [id, n] of this.nodes) {
            if (equal(n, node)) return id
        }
        return undefined
    }

    hasNode(node: Node) {
        return this.findNodeId(node) !== undefined
    }
    hasNodes(nodes: Node[] | Set<Node>): boolean {
        for (const n of nodes) if (!this.hasNode(n)) return false;
        return true;
    }

    /** Prevents duplicate nodes from being added using deep equal 
     * @returns the id of the new node, or the id of the existing node if it already exists
    */
    addNode(node: Node): Id {
        let id = this.findNodeId(node);
        if (id) return id

        id = this.newNodeId();
        this.nodes.set(id, node);
        this.adjList.set(id, new Set());

        return id
    }

    /** @returns the ids of the new nodes, or the ids of the existing nodes if they already exists */
    addNodes(nodes: Node[] | Set<Node>): string[] {
        const newIds = [];
        for (const node of nodes) newIds.push(this.addNode(node))
        return newIds
    }

    removeNode(node: Node) {
        const id = this.findNodeId(node);
        if (!id) return this

        this.nodes.delete(id);
        this.adjList.delete(id);

        for (const [_from, toSet] of this.adjList) toSet.delete(id);
        return this
    }

    /** Safely adds the nodes required for the edge to exist */
    private safeAddEdge({ from, to }: Edge<Node>) {
        const [fromId, toId] = this.addNodes([from, to]);
        (<Set<string>>this.adjList.get(fromId)).add(toId);
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
        const [fromId, toId] = [this.findNodeId(from), this.findNodeId(to)];
        if (!fromId || !toId) return false;

        if (this.adjList.get(fromId)?.has(toId)) return true
        else return this.options.directed ? false : (this.adjList.get(toId)?.has(fromId) ?? false)
    }

    removeEdge(edge: Edge<Node>) {
        const { from, to } = edge;
        const [fromId, toId] = [this.findNodeId(from), this.findNodeId(to)];
        if (!fromId || !toId) return this

        this.adjList.get(fromId)?.delete(toId);
        if (!this.options.directed) this.adjList.get(toId)?.delete(fromId);
        return this
    }


    get edges(): Edge<Node>[] {
        const { directed } = this.options;
        const edges = [];

        for (const [fromId, toSet] of this.adjList) {
            for (const toId of toSet) {
                const [from, to] = [this.nodes.get(fromId), this.nodes.get(toId)] as [Node, Node];
                edges.push({ from, to });
                if (!directed) edges.push({ from: to, to: from });
            }
        }
        return edges;
    }

    // Neighbours
    getOutNeighbours(node: Node): Set<Node> {
        const outNeighbours: Set<Node> = new Set();

        const fromId = this.findNodeId(node);
        if (!fromId) return outNeighbours;

        for (const toId of this.adjList.get(fromId) ?? []) {
            outNeighbours.add(this.nodes.get(toId) as Node);
        }
        return outNeighbours;
    }

    getInNeighbours(node: Node): Set<Node> {
        const inNeighbours: Set<Node> = new Set();

        const nodeId = this.findNodeId(node);
        if (!nodeId) return inNeighbours;

        for (const [fromId, toSet] of this.adjList) {
            if (toSet.has(nodeId)) inNeighbours.add(this.nodes.get(fromId) as Node);
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

        while (stack.length) {
            const node = stack.shift() as Node;
            if (visited.has(node)) continue;
            visited.add(node);
            if (callback) callback(node);
            stack.push(...this.getOutNeighbours(node));
        }

        return visited;
    }

    bfs(start: Node, callback?: TraversalCallback<Node>): Set<Node> {
        const visited: Set<Node> = new Set();
        const stack = [start];

        while (stack.length) {
            const node = stack.pop() as Node;
            if (visited.has(node)) continue;
            visited.add(node);
            if (callback) callback(node);
            stack.push(...this.getOutNeighbours(node));
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


    private countValues<V>(values: IterableIterator<V>): Map<V, number> {
        const counts: Map<V, number> = new Map();
        for (const v of values) {
            counts.set(v, (counts.get(v) ?? 0) + 1);
        }
        return counts;
    }

    labelPropagation(iterations = 15, getLabel: (node: Node) => Label = (node) => <string>this.findNodeId(node)) {
        // Set up initial labels
        const labels: Map<Id, Label> = new Map();
        for (const [id, node] of this.nodes) {
            labels.set(id, getLabel(node));
        }


        for (let i = 0; i < iterations; i++) {
            const newLabels: Map<Id, Label> = new Map();
            for (const [id, node] of this.nodes) {
                const neighbours = this.getNeighbours(node);
                const neighbourLabels = [...neighbours].map((n) => labels.get(this.findNodeId(n) as Id) as Label);

                const labelCounts = this.countValues(neighbourLabels.values());
                const maxLabel = Math.max(...labelCounts.values());

                newLabels.set(id, maxLabel);
            }
            labels.clear();
            newLabels.forEach((v, k) => labels.set(k, v));
        }

        return [...labels].map(([id, label]) => ({ node: (<Node>this.nodes.get(id)), label }));
    }
}
