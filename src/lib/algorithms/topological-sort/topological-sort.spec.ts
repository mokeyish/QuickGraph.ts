/**
 * Created by yish on 2020/05/10.
 */

import { BidirectionalGraph } from '../../bidirectional-graph';
import { Edge } from '../../edge';
import { TopologicalSortAlgorithm } from './topological-sort-algorithm';
import '../../ext';

describe('TopologicalSort', () => {
    const a = 'A';
    const b = 'B';
    const c = 'C';
    const d = 'D';
    const e = 'E';
    let g: BidirectionalGraph<string, Edge<string>>;
    beforeEach(() => {
        g = new BidirectionalGraph<string, Edge<string>>(false);
        g.addVertexRange([a, b, c, d, e]);
    })

    it('test 001', () => {
        g.addEdge(new Edge<string>(a, b));
        g.addEdge(new Edge<string>(a, c));
        g.addEdge(new Edge<string>(b, d));

        const sortAlgorithm = new TopologicalSortAlgorithm(g);
        sortAlgorithm.compute();
        expect(sortAlgorithm.sortedVertices).toEqual([e, a , c , b , d]);
    })
});
