/**
 * Created by yish on 2020/05/10.
 */
import { IEdge } from './interface';


export type EdgePredicate<TVertex, TEdge extends IEdge<TVertex>> = (e: TEdge) => boolean;
