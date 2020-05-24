/**
 * Created by yish on 2020/05/24.
 */
import { IEdge, IVertexListGraph } from '../../interface';
import { RootedAlgorithmBase } from '../rooted-algorithm-base';
import {
    IDistanceRecorderAlgorithm,
    ITreeBuilderAlgorithm,
    IVertexColorizerAlgorithm,
    IVertexPredecessorRecorderAlgorithm
} from '../interface';
import { EdgeAction, VertexAction } from '../../event';
import { GraphColor } from '../../graph-color';
import { Subject } from 'rxjs';
import { IAlgorithmComponent } from '../services/interface';
import { IQueue } from '../../collections/interface';
import { Queue } from '../../collections/queue';
import './../../ext';


export class BreadthFirstSearchAlgorithm<TVertex, TEdge extends IEdge<TVertex>>
    extends RootedAlgorithmBase<TVertex, IVertexListGraph<TVertex, TEdge>>
    implements IVertexPredecessorRecorderAlgorithm<TVertex, TEdge>
        , IDistanceRecorderAlgorithm<TVertex, TEdge>
        , IVertexColorizerAlgorithm<TVertex, TEdge>
        , ITreeBuilderAlgorithm<TVertex, TEdge> {
    private readonly _startVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _finishVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _treeEdge: Subject<TEdge> = new Subject<TEdge>();
    private readonly _nonTreeEdge: Subject<TEdge> = new Subject<TEdge>();
    private readonly _grayTarget: Subject<TEdge> = new Subject<TEdge>();
    private readonly _blackTarget: Subject<TEdge> = new Subject<TEdge>();
    private readonly _discoverVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _initializeVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _examineEdge: Subject<TEdge> = new Subject<TEdge>();
    private readonly _examineVertex: Subject<TVertex> = new Subject<TVertex>();
    private readonly _colors: Map<TVertex, GraphColor>;
    private readonly _vertexQueue: IQueue<TVertex>;
    private readonly _outEdgeEnumerator: (iter: IterableIterator<TEdge>) => IterableIterator<TEdge>;

    constructor(
        host: IAlgorithmComponent,
        visitedGraph: IVertexListGraph<TVertex, TEdge>,
        vertexQueue?: IQueue<TVertex>,
        vertexColors?: Map<TVertex, GraphColor>, outEdgeEnumerator?: (iter: IterableIterator<TEdge>) => IterableIterator<TEdge>) {
        super(visitedGraph, host);
        this._vertexQueue = vertexQueue ?? new Queue();
        this._colors = vertexColors ?? new Map<TVertex, GraphColor>();
        this._outEdgeEnumerator = outEdgeEnumerator ?? ((e: IterableIterator<TEdge>) => e);
    }

    public get outEdgeEnumerator(): (iter: IterableIterator<TEdge>) => IterableIterator<TEdge> {
        return this._outEdgeEnumerator;
    }

    public get startVertex(): VertexAction<TVertex> {
        return this._startVertex.asObservable();
    }
    public get finishVertex(): VertexAction<TVertex> {
        return this._finishVertex.asObservable();
    }
    public get treeEdge(): EdgeAction<TVertex, TEdge> {
        return this._treeEdge.asObservable();
    }
    public get nonTreeEdge(): EdgeAction<TVertex, TEdge> {
        return this._nonTreeEdge.asObservable();
    }
    public get grayTarget(): EdgeAction<TVertex, TEdge> {
        return this._grayTarget.asObservable();
    }
    public get blackTarget(): EdgeAction<TVertex, TEdge> {
        return this._blackTarget.asObservable();
    }
    public get discoverVertex(): VertexAction<TVertex> {
        return this._discoverVertex.asObservable();
    }
    public get examineEdge(): EdgeAction<TVertex, TEdge> {
        return this._examineEdge.asObservable();
    }
    public get examineVertex(): VertexAction<TVertex> {
        return this._examineVertex.asObservable();
    }
    public get initializeVertex(): VertexAction<TVertex> {
        return this._initializeVertex.asObservable();
    }

    public get vertexColors(): Map<TVertex, GraphColor> {
        return this._colors;
    }

    protected onStartVertex(vertex: TVertex): void {
        this._startVertex.next(vertex)
    }
    protected onFinishVertex(vertex: TVertex): void {
        this._finishVertex.next(vertex);
    }
    protected onTreeEdge(edge: TEdge): void {
        this._treeEdge.next(edge);
    }
    protected onNonTreeEdge(edge: TEdge): void {
        this._nonTreeEdge.next(edge);
    }
    protected onGrayTarget(edge: TEdge): void {
        this._grayTarget.next(edge);
    }
    protected onBlackTarget(edge: TEdge): void {
        this._blackTarget.next(edge);
    }
    protected onExamineEdge(e: TEdge): void {
        this._examineEdge.next(e);
    }

    protected onExamineVertex(v: TVertex): void {
        this._examineVertex.next(v);
    }
    protected onDiscoverVertex(vertex: TVertex): void {
        this._discoverVertex.next(vertex);
    }
    protected onInitializeVertex(vertex: TVertex): void {
        this._initializeVertex.next(vertex);
    }

    getVertexColor(v: TVertex): GraphColor {
        return this.vertexColors.get(v)!;
    }

    protected initialize() {
        super.initialize();
        const cancelManager = this.services.cancelManager;
        if (cancelManager.isCancelling) {
            return;
        }
        // initialize vertex u
        this.vertexColors.clear();
        for (const v of this.visitedGraph.vertices) {
            this.vertexColors.set(v, GraphColor.White);
            this.onInitializeVertex(v);
        }
    }

    protected internalCompute() {
        if (this.visitedGraph.vertexCount === 0) {
            return;
        }

        const result = this.tryGetRootVertex();
        if (!result.success) {
        } else {
            this.enqueueRoot(result.value);
        }
        this.flushVisitQueue();
    }
    public visit(v: TVertex): void {
        this.enqueueRoot(v);
        this.flushVisitQueue();
    }
    private enqueueRoot(v: TVertex) {
        this.onStartVertex(v);

        this.vertexColors.set(v, GraphColor.Gray);

        this.onDiscoverVertex(v);
        this._vertexQueue.enqueue(v);
    }

    private flushVisitQueue(): void {
        const cancelManager = this.services.cancelManager;
        const oee = this.outEdgeEnumerator;
        while (this._vertexQueue.count > 0) {
            if (cancelManager.isCancelling) return;

            const u = this._vertexQueue.dequeue()!;
            this.onExamineVertex(u);

            for (const e of oee(this.visitedGraph.outEdges(u))) {
                const v = e.target;
                this.onExamineEdge(e);
                const vColor = this.vertexColors.get(v)!;
                if (vColor === GraphColor.White) {
                    this.onTreeEdge(e);
                    this.vertexColors.set(v, GraphColor.Gray);
                    this.onDiscoverVertex(v);
                    this._vertexQueue.enqueue(v);
                } else {
                    this.onNonTreeEdge(e);
                    if (vColor === GraphColor.Gray) {
                        this.onGrayTarget(e);
                    } else {
                        this.onBlackTarget(e);
                    }
                }
            }

            this.vertexColors.set(u, GraphColor.Black);
            this.onFinishVertex(u);
        }
    }
}
