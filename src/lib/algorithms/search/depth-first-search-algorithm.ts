/**
 * Created by yish on 2020/05/10.
 */
import { RootedAlgorithmBase } from "../rooted-algorithm-base";
import { IEdge, IVertexListGraph } from "../../interface";
import {
    IDistanceRecorderAlgorithm,
    ITreeBuilderAlgorithm,
    IVertexColorizerAlgorithm,
    IVertexPredecessorRecorderAlgorithm,
    IVertexTimeStamperAlgorithm
} from "../interface";
import { EdgeAction, VertexAction } from "../../event";
import { GraphColor } from "../../graph-color";
import { Subject } from "rxjs";
import { IAlgorithmComponent } from "../services/interface";


export class DepthFirstSearchAlgorithm<TVertex, TEdge extends IEdge<TVertex>>
    extends RootedAlgorithmBase<TVertex, IVertexListGraph<TVertex, TEdge>>
    implements IDistanceRecorderAlgorithm<TVertex, TEdge>,
        IVertexColorizerAlgorithm<TVertex, TEdge>,
        IVertexPredecessorRecorderAlgorithm<TVertex, TEdge>,
        IVertexTimeStamperAlgorithm<TVertex, TEdge>,
        ITreeBuilderAlgorithm<TVertex, TEdge> {
    private readonly _discoverVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _initializeVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _finishVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _startVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _treeEdge: Subject<TEdge> = new Subject<TEdge>();
    private readonly _examineEdge: Subject<TEdge> = new Subject<TEdge>();
    private readonly _colors: Map<TVertex, GraphColor>;
    private _maxDepth: number = Number.MAX_VALUE;
    public readonly outEdgeEnumerator: (iter: IterableIterator<TEdge>) => IterableIterator<TEdge>;

    constructor(
        host: IAlgorithmComponent,
        visitedGraph: IVertexListGraph<TVertex, TEdge>,
        colors?: Map<TVertex, GraphColor>, outEdgeEnumerator?: (iter: IterableIterator<TEdge>) => IterableIterator<TEdge>) {
        super(visitedGraph, host);
        this._colors = colors ?? new Map<TVertex, GraphColor>();
        this.outEdgeEnumerator = outEdgeEnumerator ?? ((e: IterableIterator<TEdge>) => e);
    }

    public get initializeVertex(): VertexAction<TVertex> {
        return this._initializeVertex.asObservable();
    }
    public get discoverVertex(): VertexAction<TVertex> {
        return this._discoverVertex.asObservable();
    }
    public get finishVertex(): VertexAction<TVertex> {
        return  this._finishVertex.asObservable();
    }
    public get startVertex(): VertexAction<TVertex> {
        return this._startVertex.asObservable();
    }
    public get treeEdge(): EdgeAction<TVertex, TEdge> {
        return this._treeEdge.asObservable();
    }

    public get examineEdge(): EdgeAction<TVertex, TEdge> {
        return this._examineEdge.asObservable();
    }
    public onInitializeVertex(v: TVertex): void {
        this._initializeVertex.next(v);
    }
    public onDiscoverVertex(v: TVertex): void {
        this._discoverVertex.next(v);
    }
    public onFinishVertex(v: TVertex): void {
        this._finishVertex.next(v);
    }
    public onStartVertex(v: TVertex): void {
        this._startVertex.next(v);
    }
    public onTreeEdge(e: TEdge): void {
        this._treeEdge.next(e);
    }
    public onExamineEdge(e: TEdge): void {
        this._examineEdge.next(e);
    }

    private readonly _backEdge: Subject<TEdge> = new Subject<TEdge>();
    public get backEdge(): EdgeAction<TVertex, TEdge> {
        return this._backEdge.asObservable();
    }
    public onBackEdge(e: TEdge): void {
        return this._backEdge.next(e);
    }
    private readonly _forwardOrCrossEdge: Subject<TEdge> = new Subject<TEdge>();
    public get forwardOrCrossEdge(): EdgeAction<TVertex, TEdge> {
        return this._forwardOrCrossEdge.asObservable();
    }

    public onForwardOrCrossEdge(e: TEdge): void {
        return this._forwardOrCrossEdge.next(e);
    }


    public get vertexColors(): Map<TVertex, GraphColor> {
        return this._colors;
    }

    getVertexColor(v: TVertex): GraphColor {
        return this._colors.get(v)!;
    }

    public get maxDepth(): number {
        return this._maxDepth;
    }
    public set maxDepth(v: number) {
        this._maxDepth = v;
    }

    protected internalCompute() {
        const result = this.tryGetRootVertex();
        if (result.success) {
            this.onStartVertex(result.value);
            this.visit(result.value);
        } else {
            const cancelManager = this.services.cancelManager;

            const iter = this.visitedGraph.vertices;
            while (true) {
                if (cancelManager.isCancelling) {
                    return;
                }
                const n = iter.next();
                if (n.done) {
                    break;
                }
                if (this.vertexColors.get(n.value) === GraphColor.White) {
                    this.onStartVertex(n.value);
                    this.visit(n.value);
                }
            }
        }
    }

    protected initialize() {
        super.initialize();
        this.vertexColors.clear();
        const iter = this.visitedGraph.vertices;
        while (true) {
            const n = iter.next();
            if (n.done) {
                break;
            }
            this.vertexColors.set(n.value, GraphColor.White);
            this.onInitializeVertex(n.value);
        }
    }

    public visit(root: TVertex): void {
        const todo: SearchFrame<TVertex, TEdge>[] = []; // stack
        const oee = this.outEdgeEnumerator;
        this.vertexColors.set(root, GraphColor.Gray);
        this.onDiscoverVertex(root);

        const cancelManager = this.services.cancelManager;
        const iter = oee(this.visitedGraph.outEdges(root));
        todo.push({vertex: root, edges: iter, depth: 0});
        while (todo.length > 0) {
            if (cancelManager.isCancelling) return;

            const frame = todo.pop()!;
            let u = frame.vertex;
            let depth = frame.depth;
            let edges = frame.edges;

            if (depth > this.maxDepth) {

                this.vertexColors.set(u, GraphColor.Black);
                this.onFinishVertex(u);
                continue;
            }


            while (true) {
                const n = edges.next();
                if (n.done) {
                    break;
                }

                const e: TEdge = n.value;

                if (cancelManager.isCancelling) return;

                this.onExamineEdge(e);
                const v = e.target;
                const c = this.vertexColors.get(v);

                switch (c) {
                    case GraphColor.White:
                        this.onTreeEdge(e);
                        todo.push({ vertex: u, edges, depth});
                        u = v;
                        edges = oee(this.visitedGraph.outEdges(u));
                        depth++;
                        this.vertexColors.set(u, GraphColor.Gray);
                        this.onDiscoverVertex(u);
                        break;
                    case GraphColor.Gray:
                        this.onBackEdge(e);
                        break;
                    case GraphColor.Black:
                        this.onForwardOrCrossEdge(e);
                        break;
                }
            }

            this.vertexColors.set(u, GraphColor.Black);
            this.onFinishVertex(u);
        }
    }
}

interface SearchFrame<TVertex, TEdge extends IEdge<TVertex>> {
    readonly vertex: TVertex;
    readonly edges: IterableIterator<TEdge>;
    readonly depth: number;
}
