// Test dfs on Graph
import { assert, assertAlmostEquals } from "https://deno.land/std/testing/asserts.ts";
import { Graph } from '../src/index.ts';


Deno.test('Jaccard', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
            { from: 'b', to: 'c' }
        ]
    });

    const jaccard = graph.Jaccard('a', 'b');
    assertAlmostEquals(jaccard, 0.333333333)
})

Deno.test('Overlap', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
            { from: 'c', to: 'd' },
            { from: 'c', to: 'e' },
            { from: 'b', to: 'c' }
        ]
    });

    const overlap = graph.Overlap('a', 'b');
    assertAlmostEquals(overlap, 0.5)
})

Deno.test('AdamicAdar', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
            { from: 'c', to: 'd' },
            { from: 'c', to: 'e' },
            { from: 'b', to: 'c' }
        ]
    });

    const adamicAdar = graph.AdamicAdar('a', 'b');
    assertAlmostEquals(adamicAdar, 0.9102392266268375)
})