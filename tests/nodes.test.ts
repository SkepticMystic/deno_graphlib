import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Graph } from '../src/index.ts';

Deno.test('Add nodes', () => {
    const g = new Graph({ nodes: ['a', 'b', 'c', 'd', 'e'] });

    assert(g.nodes.has('a'));
})

Deno.test('Remove nodes', () => {
    const g = new Graph({
        nodes: ['a', 'b'],
        edges: [{ from: 'a', to: 'b' }, { from: 'c', to: 'a' }, { from: 'b', to: 'c' }]
    });

    g.removeNode('a');

    assert(!g.hasNode('a'));
    assert(!g.hasEdge({ from: 'a', to: 'b' }));
    assert(!g.hasEdge({ from: 'c', to: 'a' }));
    assert(g.hasEdge({ from: 'b', to: 'c' }));
})
