/**
 * Created by yish on 2020/05/10.
 */

import {IEdge} from "./interface";

/**
 * The default `IEdge` implementation.
 */
export class Edge<TVertex> implements IEdge<TVertex>{
    private readonly _source: TVertex;
    private readonly _target: TVertex;
    constructor(source: TVertex, target: TVertex) {
        this._source = source;
        this._target = target;
    }

    /**
     * Gets the source vertex
     */
    get source(): TVertex {
        return this._source;
    }

    /**
     * Gets the target vertex
     */
    get target(): TVertex {
        return this._target;
    }

    public toString(): string {
        return `${this._source}->${this._target}`;
    }
}
