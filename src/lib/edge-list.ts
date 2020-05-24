/**
 * Created by yish on 2020/05/10.
 */
import {IEdge, IEdgeList} from "./interface";
import { List } from "./list";

export class EdgeList<TVertex, TEdge extends IEdge<TVertex>>
    extends List<TEdge> implements IEdgeList<TVertex, TEdge>{
    constructor(capacity?: number)
    constructor(...items: TEdge[])
    constructor(args?: number | TEdge[]) {
        if (args === undefined) {
            super()
        } else if (args instanceof Array) {
            super(...args);
        } else if (args >= 0){
            super(args);
        } else {
            super()
        }
    }

    clone(): IEdgeList<TVertex, TEdge> {
        return new EdgeList(...this);
    }
}
