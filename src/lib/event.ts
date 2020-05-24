/**
 * Created by yish on 2020/05/10.
 */
import { Observable } from 'rxjs';
import { IEdge } from './interface';

/**
 * The handler for events involving edges
 */
export type EdgeAction<TVertex, TEdge extends IEdge<TVertex>> = Observable<TEdge>;


export type VertexAction<TVertex> = Observable<TVertex>;

export type EventHandler = Observable<void>;
