export function setIntersection<Node>(A: Set<Node>, B: Set<Node>): Set<Node> {
    const result = new Set<Node>();
    for (const a of A) if (B.has(a)) result.add(a);
    return result;
}

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);