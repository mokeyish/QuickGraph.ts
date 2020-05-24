/**
 * Created by yish on 2020/05/24.
 */
import '../../ext';
import { BidirectionalGraph } from '../../bidirectional-graph';
import { Edge } from '../../edge';
import { DepthFirstSearchAlgorithm } from './depth-first-search-algorithm';

class Position {
    constructor(
        public readonly x: number,
        public readonly y: number) {
    }

    public toString() {
        return `(${this.x}, ${this.y})`;
    }
}

describe('DepthFirstSearchAlgorithm', () => {
    /**
     *     0   1   2   3   4   5
     *  0 [*] [*] [*] [*] [*] [*]
     *  1 [*] _*_ ___ ___ [*] [*]
     *  2 [*] ___ [*] ___ ___ [*]
     *  3 [*] ___ ___ ___ [*] [*]
     *  4 [*] [*] ___ ___ _*_ [*]
     *  5 [*] [*] [*] [*] [*] [*]
     */
    it('labyrinth1', () => {
        const map = [
            [1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 1],
            [1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1]
        ];
        const g = new BidirectionalGraph<Position, Edge<Position>>(false);

        // region [vertices]
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map.length; y++) {
                g.addVertex(new Position(x, y));
            }
        }
        // endregion

        // region [edges]
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map.length; y++) {
                const i = map[y][x];
                if (i === 0) {
                    const source = g.vertices.find(o => o.x === x && o.y === y)!;
                    if (x + 1 < map.length) {
                        const right = map[y][x + 1];
                        if (right === 0) {
                            const target = g.vertices.find(o => o.x === x + 1 && o.y === y);
                            if (target) {
                                g.addEdge(new Edge<Position>(source, target));
                                g.addEdge(new Edge<Position>(target, source));
                            }
                        }
                    }
                    if (y + 1 < map.length) {
                        const bottom = map[y + 1][x];
                        if (bottom === 0) {
                            const target = g.vertices.find(o => o.x === x && o.y === y + 1);
                            if (target) {
                                g.addEdge(new Edge<Position>(source, target));
                                g.addEdge(new Edge<Position>(target, source));
                            }
                        }
                    }
                }
            }
        }
        // endregion

        const start = g.vertices.find(o => o.x === 1 && o.y === 1)!;
        const end = g.vertices.find(o => o.x === 4 && o.y === 4)!;
        expect(g.outDegree(start)).toEqual(2);
        expect(g.inDegree(end)).toEqual(1);
        const b = new DepthFirstSearchAlgorithm(undefined, g);
        const ways: Position[][] = [];
        const way: Position[] = [];
        b.discoverVertex.subscribe(o => {
            way.push(o);
            if (o.x === end.x && o.y === end.y) {
                ways.push(way.values().toArray());
            }
        });
        b.finishVertex.subscribe((o) => {
            way.pop();
        });

        b.compute(start);
    })
})
