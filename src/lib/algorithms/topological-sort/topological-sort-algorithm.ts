/**
 * Created by yish on 2020/05/10.
 */
import { IEdge, IVertexListGraph } from "../../interface";
import { AlgorithmBase } from "../algorithm-base";
import { DepthFirstSearchAlgorithm } from "../search/depth-first-search-algorithm";
import { GraphColor } from "../../graph-color";
import { Subscription } from "rxjs";


export class TopologicalSortAlgorithm<TVertex,TEdge extends IEdge<TVertex>>
    extends AlgorithmBase<IVertexListGraph<TVertex, TEdge>>{
    private vertices: TVertex[];
    public readonly allowCyclicGraph: boolean  = false;

    constructor(g: IVertexListGraph<TVertex, TEdge>, vertices?: TVertex[]) {
        super(g);
        this.vertices = vertices ?? [];
    }

    public get sortedVertices(): TVertex[] {
        return this.vertices;
    }

    private backEdge(edge: TEdge): void {
        if (!this.allowCyclicGraph) {
            throw new Error('Non Acyclic Graph');
        }
    }
    private finishVertex(v: TVertex): void {
        this.vertices.splice(0, 0, v);
    }

    protected internalCompute() {
        let dfs: DepthFirstSearchAlgorithm<TVertex, TEdge> = new DepthFirstSearchAlgorithm<TVertex, TEdge>(
            this,
            this.visitedGraph,
            new Map<TVertex, GraphColor>()
        );
        let backEdgeSubscription: Subscription = dfs.backEdge.subscribe(this.backEdge.bind(this));
        let finishVertexSubscription: Subscription = dfs.finishVertex.subscribe(this.finishVertex.bind(this));

        try {
            dfs.compute();
        } finally {
            backEdgeSubscription.unsubscribe();
            finishVertexSubscription.unsubscribe();
        }
    }

    compute(vertices?: TVertex[]) {
        if (vertices) {
            this.vertices = vertices;
        }
        this.vertices.splice(0, this.vertices.length);
        super.compute();
    }

}
