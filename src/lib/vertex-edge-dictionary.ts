/**
 * Created by yish on 2020/05/10.
 */
import { IEdge, IEdgeList, IEqualityComparer, IVertexEdgeDictionary } from "./interface";
import { TryOutResult } from "./try-result";


export class VertexEdgeDictionary<TVertex, TEdge extends IEdge<TVertex>>
    extends Map<TVertex, IEdgeList<TVertex, TEdge>>
    implements IVertexEdgeDictionary<TVertex, TEdge> {
    constructor(private vertexCapacity: number = -1, private vertexComparer?: IEqualityComparer<TVertex>) {
        super()
    }

    public get count(): number {
        return super.size;
    }

    add(key: TVertex, value: IEdgeList<TVertex, TEdge>): boolean {
        if (this.containsKey(key)) {
            return false;
        }
        super.set(key, value);
        return true;
    }

    clone(): IVertexEdgeDictionary<TVertex, TEdge> {
        const dict = new VertexEdgeDictionary<TVertex, TEdge>(this.vertexCapacity, this.vertexComparer);
        for (const i of this.entries()) {
            dict.add(i[0], i[1]);
        }
        return dict;
    }

    containsKey(key: TVertex): boolean {
        return super.has(key);
    }

    remove(key: TVertex): boolean {
        return super.delete(key);
    }

    tryGetValue(v: TVertex): TryOutResult<IEdgeList<TVertex, TEdge>> {
        if (this.has(v)) {
            return {
                success: true,
                value: this.get(v)!
            }
        }
        return {success: false};
    }
}
