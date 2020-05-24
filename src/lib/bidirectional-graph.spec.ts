/**
 * Created by yish on 2020/05/10.
 */
import { BidirectionalGraph } from "./bidirectional-graph";
import { Edge } from "./edge";
import './ext'

describe("BidirectionalGraph", () => {
    const e = 'E';
    const d = 'D';
    const a = 'A';
    const b = 'B';
    const c = 'C';
    let g: BidirectionalGraph<string, Edge<string>>;
    beforeEach(() => {
        g = new BidirectionalGraph<string, Edge<string>>(false);
        g.addVertexRange([a, b, c, d, e]);
    })
    it("vertexCount", () => {
        expect(g.vertexCount).toEqual(5);
    })

    it("edgeCount", () => {
        expect(g.edgeCount).toEqual(0);
    })

    it("edgeCount 1", () => {
        g.addEdge(new Edge<string>(a, b));
        expect(g.edgeCount).toEqual(1);
    })

    it("edgeCount 2", () => {
        g.addEdge(new Edge<string>(a, b));
        g.addEdge(new Edge<string>(a, c));
        expect(g.edgeCount).toEqual(2);
    })

    it("inDegree 1", () => {
        g.addEdge(new Edge<string>(a, b));
        g.addEdge(new Edge<string>(d, b));
        g.addEdge(new Edge<string>(d, c));
        expect(g.inDegree(b)).toEqual(2);
        expect(g.inDegree(c)).toEqual(1);
    })

    it("outDegree 1", () => {
        g.addEdge(new Edge<string>(a, b));
        g.addEdge(new Edge<string>(a, e));
        g.addEdge(new Edge<string>(d, c));
        expect(g.outDegree(a)).toEqual(2);
        expect(g.outDegree(d)).toEqual(1);
    })

    it("inEdge 1", () => {
        g.addEdge(new Edge<string>(a, b));
        expect(g.inEdge(a, 0)).toEqual(undefined);
        expect(g.inEdge(b, 0).source).toEqual(a);
    })

    it("inEdge 2", () => {
        g.addEdge(new Edge<string>(a, b));
        g.addEdge(new Edge<string>(a, c));
        expect(g.inEdge(a, 0)).toEqual(undefined);
        expect(g.inEdge(b, 0).source).toEqual(a);
    })

    it("outEdge 1", () => {
        g.addEdge(new Edge<string>(a, b));
        expect(g.outEdge(a, 0).target).toEqual(b);
        expect(g.outEdge(b, 0)).toEqual(undefined);
    })

})
