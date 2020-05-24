/**
 * Created by yish on 2020/05/10.
 */
import {
    IBidirectionalGraph,
    IEdge,
    IEdgeListAndIncidenceGraph,
    IMutableEdgeListGraph,
    IMutableIncidenceGraph, IMutableVertexListGraph,
    IVertexAndEdgeListGraph,
    IMutableVertexAndEdgeListGraph, IMutableBidirectionalGraph, IVertexEdgeDictionary, IEqualityComparer
} from "./interface";
import { TryOutResult } from "./try-result";
import { VertexEdgeDictionary } from "./vertex-edge-dictionary";
import { EqualityComparer } from "./equality-comparer";
import { EdgeList } from "./edge-list";
import { EdgeAction, VertexAction } from "./event";
import { Observable, Subject } from "rxjs";
import { VertexPredicate } from "./vertex-predicate";
import { VertexList } from "./vertex-list";
import { EdgePredicate } from "./edge-predicate";

/**
 *  A mutable directed graph data structure efficient for sparse
 *  graph representation where out-edge and in-edges need to be enumerated. Requires
 *  twice as much memory as the adjacency graph.
 */
export class BidirectionalGraph<TVertex, TEdge extends IEdge<TVertex>>
    implements IVertexAndEdgeListGraph<TVertex, TEdge>,
        IEdgeListAndIncidenceGraph<TVertex, TEdge>,
        IMutableEdgeListGraph<TVertex, TEdge>,
        IMutableIncidenceGraph<TVertex, TEdge>,
        IMutableVertexListGraph<TVertex, TEdge>,
        IBidirectionalGraph<TVertex, TEdge>,
        IMutableBidirectionalGraph<TVertex, TEdge>,
        IMutableVertexAndEdgeListGraph<TVertex, TEdge> {
    private readonly _isDirected = true;
    private readonly _allowParallelEdges: boolean = false;
    private readonly _vertexOutEdges: IVertexEdgeDictionary<TVertex, TEdge>;
    private readonly _vertexInEdges: IVertexEdgeDictionary<TVertex, TEdge>;
    private readonly _vertexComparer: IEqualityComparer<TVertex>;
    private _edgeCount: number = 0;
    private _edgeCapacity: number = -1;

    constructor(
        allowParallelEdges: boolean = true, vertexCapacity: number = -1, edgeCapacity: number = -1,
        vertexComparer?: IEqualityComparer<TVertex>) {
        this._vertexComparer = vertexComparer || new EqualityComparer();
        this._allowParallelEdges = allowParallelEdges;
        this._vertexInEdges = new VertexEdgeDictionary(vertexCapacity, this._vertexComparer);
        this._vertexOutEdges = new VertexEdgeDictionary(vertexCapacity, this._vertexComparer);

        this._edgeCapacity = edgeCapacity;
    }

    public get edgeCapacity(): number {
        return this._edgeCapacity;
    }

    public set edgeCapacity(v: number) {
        this._edgeCapacity = v;
    }

    public isInEdgesEmpty(v: TVertex): boolean {
        return this._vertexInEdges.get(v)?.count === 0;
    }

    public inDegree(v: TVertex): number {
        return this._vertexInEdges.get(v)?.count ?? 0;
    }

    public inEdges(v: TVertex): IterableIterator<TEdge> {
        return this._vertexInEdges.get(v)?.values() ?? new EdgeList<TVertex, TEdge>().values();
    }

    public tryGetInEdges(v: TVertex): TryOutResult<IterableIterator<TEdge>> {
        const result = this._vertexInEdges.tryGetValue(v);
        if (result.success) {
            return {
                success: true,
                value: result.value!.values()
            }
        }
        return {
            success: false
        }
    }

    public inEdge(v: TVertex, index: number): TEdge {
        return this.inEdges(v).toArray()[index];
    }

    public degree(v: TVertex): number {
        return this.inDegree(v) + this.outDegree(v);
    }

    private readonly _vertexAdded = new Subject<TVertex>();
    private readonly _vertexRemoved = new Subject<TVertex>();

    public get vertexAdded(): VertexAction<TVertex> {
        return this._vertexAdded.asObservable();
    }

    public get vertexRemoved(): VertexAction<TVertex> {
        return this._vertexRemoved.asObservable();
    }

    public addVertex(v: TVertex): boolean {
        if (this.containsVertex(v)) {
            return false;
        }

        this._vertexOutEdges.add(v, new EdgeList(this._edgeCapacity));
        this._vertexInEdges.add(v, new EdgeList(this._edgeCapacity));
        this.onVertexAdded(v);
        return true;
    }

    protected onVertexAdded(v: TVertex): void {
        this._vertexAdded.next(v);
    }

    protected onVertexRemoved(v: TVertex): void {
        this._vertexRemoved.next(v);
    }

    public addVertexRange(vertices: TVertex[]): number {
        let count = 0;
        for (const v of vertices) {
            if (this.addVertex(v)) {
                count++ ;
            }
        }
        return count;
    }

    public removeVertex(v: TVertex): boolean {
        if (!this.containsVertex(v)) {
            return false;
        }
        const edgesToRemove: EdgeList<TVertex, TEdge> = new EdgeList();
        for (const outEdge of this.outEdges(v)) {
            this._vertexInEdges.get(outEdge.target)!.remove(outEdge);
            edgesToRemove.add(outEdge);
        }
        for (const inEdge of this.inEdges(v)) {
            // might already have been removed
            if (this._vertexOutEdges.get(inEdge.source)!.remove(inEdge)) {
                edgesToRemove.add(inEdge);
            }
        }
        // notify users
        for (const edge of edgesToRemove) {
            this.onEdgeRemoved(edge);
        }
        this._vertexOutEdges.remove(v);
        this._vertexInEdges.remove(v);
        this._edgeCount -= edgesToRemove.length;
        this.onVertexRemoved(v);
        return true;
    }

    protected onEdgeAdded(edge: TEdge): void {
        this._edgeAdded.next(edge);
    }

    protected onEdgeRemoved(edge: TEdge): void {
        this._edgeRemoved.next(edge);
    }

    public removeVertexIf(predicate: VertexPredicate<TVertex>): number {
        const vertices = new VertexList<TVertex>();
        for (const v of this.vertices) {
            if (predicate(v)) {
                vertices.add(v);
            }
        }
        for (const v of vertices) {
            this.removeVertex(v);
        }
        return vertices.length;
    }

    public removeOutEdgeIf(v: TVertex, predicate: EdgePredicate<TVertex, TEdge>): number {
        const edges = new EdgeList<TVertex, TEdge>();

        for (const edge of this.outEdges(v)) {
            if (predicate(edge)) {
                edges.add(edge);
            }
        }
        for (const edge of edges) {
            this.removeEdge(edge);
        }
        return edges.length;
    }

    public clearOutEdges(v: TVertex): void {
        const outEdges = this._vertexOutEdges.get(v)!;
        for (const edge of outEdges.values()) {
            this._vertexInEdges.get(edge.target)!.remove(edge);
        }
        this._edgeCount -= outEdges.count;
        outEdges.clear();
    }

    public trimEdgeExcess(): void {
        throw new Error("Method not implemented.");
    }

    public addEdge(edge: TEdge): boolean {
        if (!this.allowParallelEdges) {
            if (this.containsVertexEdge(edge.source, edge.target)){
                return false;
            }
        }
        this._vertexOutEdges.get(edge.source)!.add(edge);
        this._vertexInEdges.get(edge.target)!.add(edge);
        this._edgeCount++;
        this.onEdgeAdded(edge);
        return true;
    }

    private readonly _edgeAdded: Subject<TEdge> = new Subject();

    public get edgeAdded(): EdgeAction<TVertex, TEdge> {
        return this._edgeAdded.asObservable();
    }

    public addEdgeRange(edges: TEdge[]): number {
        let count = 0;
        for (const edge of edges) {
            if (this.addEdge(edge)){
                count++;
            }
        }
        return count;
    }

    public removeEdge(edge: TEdge): boolean {
        if (this._vertexOutEdges.get(edge.source)!.remove(edge)){
            this._vertexInEdges.get(edge.target)!.remove(edge);
            this._edgeCount--;
            this.onEdgeRemoved(edge);
            return true;
        }
        return false;
    }


    private readonly _edgeRemoved: Subject<TEdge> = new Subject();
    public get edgeRemoved(): EdgeAction<TVertex, TEdge> {
        return this._edgeRemoved.asObservable();
    }


    public clear(): void {
        this._vertexOutEdges.clear();
        this._vertexInEdges.clear();
        this._edgeCount = 0;
        this.onCleared();
    }

    private onCleared(): void {
        this._cleared.next();
    }

    private readonly _cleared: Subject<void> = new Subject<void>();

    public get cleared(): Observable<void> {
        return this._cleared.asObservable();
    }

    public get allowParallelEdges(): boolean {
        return this._allowParallelEdges;
    }

    public get edgeCount(): number {
        return this._edgeCount;
    }

    public get edges(): TEdge[] {
        const lst = new EdgeList<TVertex, TEdge>();
        for (const edges of this._vertexOutEdges.values()) {
            for (const edge of edges.values()) {
                lst.push(edge);
            }
        }
        return lst;
    }

    public get isDirected(): boolean {
        return this._isDirected;
    }

    public get isEdgesEmpty(): boolean {
        return this.edgeCount === 0;
    }

    public get isVerticesEmpty(): boolean {
        return this._vertexOutEdges.count === 0;
    }

    public get vertexCount(): number {
        return this._vertexOutEdges.count;
    }

    public get vertices():  IterableIterator<TVertex> {
        return this._vertexOutEdges.keys();
    }

    public containsEdge(edge: TEdge): boolean {
        const result = this._vertexOutEdges.tryGetValue(edge.source);
        if (result.success) {
            return result.value!.contains(edge);
        }
        return false;
    }

    public containsVertex(vertex: TVertex): boolean {
        return this._vertexOutEdges.containsKey(vertex);
    }

    public containsVertexEdge(source: TVertex, target: TVertex): boolean {
        const result = this.tryGetOutEdges(source);
        if (!result.success) {
            return false;
        }

        for (const outEdge of result.value!.toArray()) {
            if (this._vertexComparer.equals(outEdge.target, target)) {
                return true;
            }
        }
        return false;
    }

    public isOutEdgesEmpty(v: TVertex): boolean {
        return this.outDegree(v) === 0;
    }

    public outDegree(v: TVertex): number {
        return this._vertexOutEdges.get(v)?.count ?? 0;
    }

    public outEdge(v: TVertex, index: number): TEdge {
        return this.outEdges(v).toArray()[index];
    }

    public outEdges(v: TVertex): IterableIterator<TEdge> {
        return this._vertexOutEdges.get(v)?.values() ?? [].values();
    }

    public tryGetOutEdges(v: TVertex): TryOutResult<IterableIterator<TEdge>> {
        const result = this._vertexOutEdges.tryGetValue(v);
        if (result.success) {
            return {
                success: true,
                value: result.value!.values()
            }
        }
        return {success: false};
    }

    public tryGetVertexEdge(source: TVertex, target: TVertex): TryOutResult<TEdge> {
        const result = this._vertexOutEdges.tryGetValue(source);
        if (result.success){
            for (const edge of result.value!.values()) {
                if (this._vertexComparer.equals(edge.target, target)) {
                    return {
                        success: true,
                        value: edge
                    }
                }
            }
        }
        return { success: false};
    }

    public tryGetVertexEdges(source: TVertex, target: TVertex): TryOutResult<IterableIterator<TEdge>> {
        const result = this._vertexOutEdges.tryGetValue(source);
        if (result.success){
            const lst = new EdgeList<TVertex, TEdge>();
            for (const edge of result.value!.values()) {
                if (this._vertexComparer.equals(edge.target, target)) {
                    lst.add(edge);
                }
            }
            return {
                success: true,
                value: lst.values()
            }
        }
        return { success: false};
    }

    public addVerticesAndEdge(edge: TEdge): boolean {
        this.addVertex(edge.source);
        this.addVertex(edge.target);
        return this.addEdge(edge);
    }

    public addVerticesAndEdgeRange(edges: TEdge[]): number {
        let count = 0;
        for (const edge of edges) {
            if (this.addVerticesAndEdge(edge)) {
                count++;
            }
        }
        return count;
    }

    public clearEdges(v: TVertex): void {
        this.clearOutEdges(v);
        this.clearInEdges(v);
    }

    public clearInEdges(v: TVertex): void {
        const inEdges = this._vertexInEdges.get(v)!;

        for (const edge of inEdges.values()) {
            this._vertexOutEdges.get(edge.source)!.remove(edge);
            this.onEdgeRemoved(edge);
        }
        this._edgeCount -= inEdges.count;
        inEdges.clear();
    }

    public removeEdgeIf(predicate: EdgePredicate<TVertex, TEdge>): number {
        const edges = new EdgeList<TVertex, TEdge>();
        for (const edge of this.edges) {
            if (predicate(edge)) {
                edges.add(edge);
            }
        }
        for (const edge of edges) {
            this.removeEdge(edge);
        }
        return edges.count;
    }

    public removeInEdgeIf(v: TVertex, predicate: EdgePredicate<TVertex, TEdge>): number {
        const edges = new EdgeList<TVertex, TEdge>();
        for (const edge of this.outEdges(v)) {
            if (predicate(edge)) {
                edges.push(edge);
            }
        }
        for (const edge of edges) {
            this.removeEdge(edge);
        }
        return edges.length;
    }

}
