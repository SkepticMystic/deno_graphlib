import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Graph } from '../src/index.ts';


Deno.test('Out Neighbours', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
        ]
    });

    assert(graph.getOutNeighbours('a').has('b'));
    assert(graph.getOutNeighbours('c').has('a'));
});

Deno.test('In Neighbours', () => {
    const graph = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
        ]
    });

    const inA = graph.getInNeighbours('a')
    assert(inA.size === 1 && inA.has('c'), 'a failed');

    const inB = graph.getInNeighbours('b')
    assert(inB.size === 1 && inB.has('a'), 'b failed');

    assert(graph.getInNeighbours('c').size === 0, 'c failed');
})
