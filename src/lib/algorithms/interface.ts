/**
 * Created by yish on 2020/05/10.
 */
import { ComputationState } from "./computation-state";
import { Observable } from "rxjs";
import { IEdge } from "../interface";
import { EdgeAction, VertexAction } from "../event";
import { GraphColor } from "../graph-color";

export interface IComputation {
    readonly state: ComputationState;

    compute(): void;
    abort(): void;

    readonly stateChanged: Observable<void>;
    readonly started: Observable<void>;
    readonly finished: Observable<void>;
    readonly aborted: Observable<void>;
}

export interface IAlgorithm<TGraph> extends IComputation{
    readonly visitedGraph: TGraph;
}

export interface IDistanceRecorderAlgorithm<TVertex, TEdge extends IEdge<TVertex>> {
    readonly initializeVertex: VertexAction<TVertex>;
    readonly discoverVertex: VertexAction<TVertex>;
}

export interface IVertexColorizerAlgorithm<TVertex, TEdge extends IEdge<TVertex>> {
    getVertexColor(v: TVertex): GraphColor;
}

export interface ITreeBuilderAlgorithm<TVertex, TEdge extends IEdge<TVertex>> {
    readonly treeEdge: EdgeAction<TVertex, TEdge>
}

export interface IVertexPredecessorRecorderAlgorithm<TVertex, TEdge extends IEdge<TVertex>>
    extends ITreeBuilderAlgorithm<TVertex, TEdge>{

    readonly startVertex: VertexAction<TVertex>;
    readonly finishVertex: VertexAction<TVertex>;
}

export interface IVertexTimeStamperAlgorithm<TVertex, TEdge extends IEdge<TVertex>> {
    readonly discoverVertex: VertexAction<TVertex>;
    readonly finishVertex: VertexAction<TVertex>
}
