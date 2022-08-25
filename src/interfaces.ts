export type Edge<T> = { from: T, to: T };

export type GraphOptions = {
    addNodesIfMissing?: boolean;
    directed?: boolean;
}
export interface IGraph<T> { nodes?: T[] | Set<T>, edges?: Edge<T>[], options?: GraphOptions }