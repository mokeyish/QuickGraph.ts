/**
 * Created by yish on 2020/05/10.
 */

import {TryOutResult} from "./try-result";
import {Observable} from "rxjs";
import {EdgeAction, VertexAction} from "./event";
import {EdgePredicate} from "./edge-predicate";
import {VertexPredicate} from "./vertex-predicate";

/**
 *  A directed edge
 */
export interface IEdge<TVertex> {
    /**
     * Gets the source vertex
     */
    readonly source: TVertex;

    /**
     * Gets the target vertex
     */
    readonly target: TVertex;
}

/**
 * An implicit set of vertices
 */
export interface ImplicitVertexSet<TVertex> {

    /**
     * Determines whether the specified vertex contains vertex.
     * @param vertex The vertex.
     * @return `true` if the specified vertex contains vertex; otherwise, `false`
     */
    containsVertex(vertex: TVertex): boolean;
}

/**
 * A graph with vertices of type TVertex and edges of type TEdge
 */
export interface IGraph<TVertex, TEdge extends IEdge<TVertex>> {
    /**
     * Gets a value indicating if the graph is directed
     */
    readonly isDirected: boolean;

    /**
     *  Gets a value indicating if the graph allows parallel edges
     */
    readonly allowParallelEdges: boolean;
}

/**
 * A set of edges
 */
export interface IEdgeSet<TVertex, TEdge extends IEdge<TVertex>> {
    /**
     * Gets a value indicating whether there are no edges in this set.
     */
    readonly isEdgesEmpty: boolean;

    /**
     * Gets the edge count.
     */
    readonly edgeCount: number;

    /**
     * Gets the edges.
     */
    readonly edges: TEdge[];

    /**
     * Determines whether the specified edge contains edge.
     * @param edge
     */
    containsEdge(edge: TEdge): boolean;
}

/**
 * An implicit set of vertices
 */
export interface IImplicitVertexSet<TVertex> {

    /**
     * Determines whether the specified vertex contains vertex.
     * @param vertex
     */
    containsVertex(vertex: TVertex): boolean;
}

/**
 * A implicit directed graph datastructure
 */
export interface IImplicitGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IGraph<TVertex, TEdge>,
        IImplicitVertexSet<TVertex> {

    /**
     * Determines whether there are out-edges associated to `v`
     * @param v The vertex.
     */
    isOutEdgesEmpty(v: TVertex): boolean;

    /**
     * Gets the count of out-edges of `v`
     * @param v The vertex.
     */
    outDegree(v: TVertex): number;

    /**
     * Gets the out-edges of `v`
     * @param v The vertex.
     */
    outEdges(v: TVertex): IterableIterator<TEdge>;

    /**
     *  Tries to get the out-edges of `v`
     * @param v The vertex.
     */
    tryGetOutEdges(v: TVertex): TryOutResult<IterableIterator<TEdge>>;

    /**
     * Gets the out-edge of `v` at position `index`.
     * @param v The vertex.
     * @param index The index.
     */
    outEdge(v: TVertex, index: number): TEdge;
}

export interface IIncidenceGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IImplicitGraph<TVertex, TEdge> {

    containsVertexEdge(source: TVertex, target: TVertex): boolean;

    tryGetVertexEdges(source: TVertex, target: TVertex): TryOutResult<IterableIterator<TEdge>>;

    tryGetVertexEdge(source: TVertex, target: TVertex): TryOutResult<TEdge>;
}

/**
 * A set of vertices
 */
export interface IVertexSet<TVertex> extends IImplicitVertexSet<TVertex> {

    /**
     *  Gets a value indicating whether there are no vertices in this set.
     */
    readonly isVerticesEmpty: boolean;

    /**
     * Gets the vertex count.
     */
    readonly vertexCount: number;

    /**
     * Gets the vertices.
     */
    readonly vertices: IterableIterator<TVertex>;
}

/**
 * A directed graph datastructure where out-edges can be traversed,
 * i.e. a vertex set + implicit graph.
 */
export interface IVertexListGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IIncidenceGraph<TVertex, TEdge>,
        IVertexSet<TVertex> {
}

/**
 * A graph whose edges can be enumerated
 */
export interface IEdgeListGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IGraph<TVertex, TEdge>, IEdgeSet<TVertex, TEdge>,
        IVertexSet<TVertex> {
}

/**
 * A directed graph where vertices and edges can be enumerated efficiently.
 */
export interface IVertexAndEdgeListGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IVertexListGraph<TVertex, TEdge>,
        IEdgeListGraph<TVertex, TEdge> {
}

/**
 * An incidence graph whose edges can be enumerated
 */
export interface IEdgeListAndIncidenceGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IEdgeListGraph<TVertex, TEdge>,
        IIncidenceGraph<TVertex, TEdge> {
}

/**
 * A mutable graph instance
 */
export interface IMutableGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IGraph<TVertex, TEdge> {

    /**
     * Clears the vertex and edges
     */
    clear(): void;

    /**
     * Called when the graph vertices and edges have been cleared.
     */
    readonly cleared: Observable<void>;
}

/**
 * A mutable edge list graph.
 */
export interface IMutableEdgeListGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IMutableGraph<TVertex, TEdge>,
        IEdgeListGraph<TVertex, TEdge> {

    /**
     * Adds the edge to the graph
     * @param edge The edge.
     * @return true if the edge was added, otherwise false.
     */
    addEdge(edge: TEdge): boolean;

    /**
     * Raised when an edge is added to the graph.
     */
    readonly edgeAdded: EdgeAction<TVertex, TEdge>;

    /**
     * Adds a set of edges to the graph.
     * @param edges
     */
    addEdgeRange(edges: TEdge[]): number;

    /**
     * Removes `edge` from the graph
     * @param edge The edge.
     */
    removeEdge(edge: TEdge): boolean;

    /**
     * Raised when an edge has been removed from the graph.
     */
    readonly edgeRemoved: EdgeAction<TVertex, TEdge>;

    /**
     * Removes all edges that match `predicate`.
     * @param predicate A pure delegate that takes an TEdge and returns true if the edge should be removed.
     */
    removeEdgeIf(predicate: EdgePredicate<TVertex, TEdge>): number;
}

/**
 * A mutable incidence graph
 */
export interface IMutableIncidenceGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IMutableGraph<TVertex, TEdge>,
        IIncidenceGraph<TVertex, TEdge> {

    /**
     * Removes all out edges of `v`
     */
    removeOutEdgeIf(v: TVertex, predicate: EdgePredicate<TVertex, TEdge>): number;

    /**
     * Trims the out edges of vertex `v`
     * @param v The version.
     */
    clearOutEdges(v: TVertex): void;

    /**
     *  Trims excess storage allocated for edges
     */
    trimEdgeExcess(): void;
}

/**
 * A mutable vertex set
 */
export interface IMutableVertexSet<TVertex> extends  IVertexSet<TVertex> {
    readonly vertexAdded: VertexAction<TVertex>;
    readonly vertexRemoved: VertexAction<TVertex>;
    addVertex(v: TVertex): boolean;
    addVertexRange(vertices: TVertex[]): number;
    removeVertex(v: TVertex): boolean;
    removeVertexIf(predicate: VertexPredicate<TVertex>): number;
}

/**
 * A mutable vertex list graph
 */
export interface IMutableVertexListGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IMutableIncidenceGraph<TVertex, TEdge>,
    IMutableVertexSet<TVertex> {
}

/**
 *  directed graph datastructure that is efficient
 *  to traverse both in and out edges.
 */
export interface IBidirectionalIncidenceGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IIncidenceGraph<TVertex, TEdge> {
    /**
     * Determines whether `v` has no in-edges.
     * @param v The vertex
     * @return true if `v` has no in-edges; otherwise, false.
     */
    isInEdgesEmpty(v: TVertex): boolean;

    /**
     * Gets the number of in-edges of `v`
     * @param v The vertex
     * @return The number of in-edges pointing towards `v`
     */
    inDegree(v: TVertex): number;

    /**
     * Gets the collection of in-edges of `v`
     * @param v The vertex
     * @return The collection of in-edges of `v`
     */
    inEdges(v: TVertex): IterableIterator<TEdge>;

    /**
     *  Tries to get the in-edges of `v`
     * @param v
     */
    tryGetInEdges(v: TVertex): TryOutResult<IterableIterator<TEdge>>;

    /**
     * Gets the in-edge at location `index`
     * @param v The vertex
     * @param index The index
     */
    inEdge(v: TVertex, index: number): TEdge;

    /**
     * Gets the degree of `v`
     * the sum of the out-degree and in-degree of `v`
     * @param v The vertex
     * @return The sum of OutDegree and InDegree of `v`
     */
    degree(v: TVertex): number;
}

/**
 * A directed graph data structure that is efficient
 * to traverse both in and out edges.
 */
export interface IBidirectionalGraph<TVertex, TEdge extends IEdge<TVertex>>
    extends IVertexAndEdgeListGraph<TVertex,TEdge>,
        IBidirectionalIncidenceGraph<TVertex, TEdge>{
}

/**
 * A mutable vertex and edge set
 */
export interface IMutableVertexAndEdgeSet<TVertex, TEdge extends IEdge<TVertex>>
    extends IEdgeListGraph<TVertex, TEdge>,
        IMutableVertexSet<TVertex>,
        IMutableEdgeListGraph<TVertex, TEdge> {
    /**
     * Adds the vertices and edge to the graph.
     * @param edge The edge.
     * @return true if the edge was added, otherwise false.
     */
    addVerticesAndEdge(edge: TEdge): boolean;

    /**
     * dds a set of edges (and it's vertices if necessary)
     * @param edges
     * @return the number of edges added.
     */
    addVerticesAndEdgeRange(edges: TEdge[]): number;
}

/**
 * A mutable vertex and edge list graph
 */
export interface IMutableVertexAndEdgeListGraph<TVertex, TEdge extends IEdge<TVertex>>  extends
    IMutableVertexListGraph<TVertex,TEdge>, IMutableEdgeListGraph<TVertex,TEdge>,
    IMutableVertexAndEdgeSet<TVertex,TEdge>, IVertexAndEdgeListGraph<TVertex,TEdge>{
}

/**
 * A mutable bidirectional directed graph
 */
export interface IMutableBidirectionalGraph<TVertex, TEdge extends IEdge<TVertex>> extends
    IMutableVertexAndEdgeListGraph<TVertex,TEdge>,
    IBidirectionalGraph<TVertex,TEdge>{

    /**
     * Removes in-edges of `v` that match predicate
     * @param v The vertex
     * @param predicate
     * @return Number of edges removed
     */
    removeInEdgeIf(v: TVertex, predicate: EdgePredicate<TVertex, TEdge>): number;

    /**
     * Clears in-edges of `v`
     * @param v
     */
    clearInEdges(v: TVertex): void;

    /**
     * Clears edges of `v`
     * @param v
     */
    clearEdges(v: TVertex): void;
}

/**
 * A cloneable list of edges
 */
export interface IEdgeList<TVertex, TEdge extends IEdge<TVertex>> {
    readonly count: number;
    values(): IterableIterator<TEdge>;
    add(edge: TEdge): boolean;
    remove(edge: TEdge): boolean;
    clear(): void;
    contains(edge: TEdge): boolean;

    /**
     * Trims excess allocated space
     */
    trimExcess(): void;

    /**
     *  Gets a clone of this list
     * @constructor
     */
    clone(): IEdgeList<TVertex, TEdge>;
}

/**
 * A dictionary of vertices to a list of edges
 */
export interface IVertexEdgeDictionary<TVertex, TEdge extends IEdge<TVertex>> {

    add(key: TVertex, value: IEdgeList<TVertex, TEdge>): boolean;
    remove(key: TVertex): boolean;

    get(key: TVertex): IEdgeList<TVertex, TEdge> | undefined;
    set(key: TVertex, value: IEdgeList<TVertex, TEdge>): void;

    tryGetValue(k: TVertex): TryOutResult<IEdgeList<TVertex, TEdge>>;

    keys():  IterableIterator<TVertex>;

    values(): IterableIterator<IEdgeList<TVertex, TEdge>>;

    readonly count: number;

    containsKey(key: TVertex): boolean;

    clear(): void;

    /**
     * Gets a clone of the dictionary. The vertices and edges are not cloned.
     */
    clone(): IVertexEdgeDictionary<TVertex, TEdge>;
}

export interface IEqualityComparer<T> {
    /**
     * Determines whether the specified objects are equal.
     * @param x The first object of type T to compare.
     * @param y The second object of type T to compare.
     * @return true if the specified objects are equal; otherwise, false.
     */
    equals(x: T, y: T): boolean;

    /**
     * Returns a hash code for the specified object.
     * @param v The value for which a hash code is to be returned.
     * @return A hash code for the specified object.
     */
    getHashCode(v: T): number;
}
