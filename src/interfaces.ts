export type Edge<Node> = { from: Node, to: Node };

export type GraphOptions = {
    addNodesIfMissing?: boolean;
    directed?: boolean;
    nodeIdLength?: number;
}
export interface IGraph<Node> { nodes?: Node[] | Set<Node>, edges?: Edge<Node>[], options?: GraphOptions }

export type TraversalCallback<Node> = (node: Node) => void

export type ResultMap = Record<string, number>
export type NodeMeasure<Node> = { node: Node, measure: number }

export type Id = string
export type Label = string | number