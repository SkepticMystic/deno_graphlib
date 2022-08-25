import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Graph } from '../src/index.ts';

Deno.test('Add edges', () => {
    const directed = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
        ]
    });
    const undirected = new Graph({
        edges: [{ from: 'a', to: 'b' }],
        options: { directed: false }
    });

    assert(directed.hasEdge({ from: 'a', to: 'b' }));
    assert(directed.hasEdge({ from: 'c', to: 'a' }));

    assert(undirected.hasEdge({ from: 'a', to: 'b' }));
    assert(undirected.hasEdge({ from: 'b', to: 'a' }));
})

Deno.test('Remove edges', () => {
    const directed = new Graph({
        edges: [
            { from: 'a', to: 'b' },
            { from: 'c', to: 'a' },
        ]
    });
    const undirected = new Graph({
        edges: [{ from: 'a', to: 'b' }],
        options: { directed: false }
    });

    directed.removeEdge({ from: 'a', to: 'b' });
    directed.removeEdge({ from: 'c', to: 'a' });
    undirected.removeEdge({ from: 'a', to: 'b' });
    undirected.removeEdge({ from: 'b', to: 'a' });

    assert(!directed.hasEdge({ from: 'a', to: 'b' }));
    assert(!directed.hasEdge({ from: 'c', to: 'a' }));
    assert(!undirected.hasEdge({ from: 'a', to: 'b' }));
    assert(!undirected.hasEdge({ from: 'b', to: 'a' }));
})