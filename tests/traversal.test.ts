// Test dfs on Graph
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Graph } from '../src/index.ts';


Deno.test('dfs', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
            { from: 'b', to: 'e' },
            { from: 'e', to: 'f' },
            { from: 'f', to: 'g' },
            { from: 'g', to: 'h' },
        ]
    });

    const dfs = [...graph.dfs('a')];
    assert(dfs[0] === 'a')
    assert(dfs[1] === 'b')
    assert(dfs.length === 6)
});

// Test bfs on Graph

Deno.test('bfs', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
            { from: 'b', to: 'e' },
            { from: 'e', to: 'f' },
            { from: 'f', to: 'g' },
            { from: 'g', to: 'h' },
        ]
    });

    const bfs = [...graph.bfs('a')];
    assert(bfs[0] === 'a')
    assert(bfs[1] === 'b')
    assert(bfs.length === 6)
})