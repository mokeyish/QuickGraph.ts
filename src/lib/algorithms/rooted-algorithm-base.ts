/**
 * Created by yish on 2020/05/10.
 */
import { AlgorithmBase } from './algorithm-base';
import { IAlgorithmComponent } from './services/interface';
import { TryOutResult } from '../try-result';
import { getDefaultComparer } from '../collections/comparer';
import { Observable, Subject } from 'rxjs';

export abstract class RootedAlgorithmBase<TVertex, TGraph>
    extends AlgorithmBase<TGraph>{
    private rootVertex?: TVertex;
    private hasRootVertex = false;

    protected constructor(visitedGraph: TGraph, host?: IAlgorithmComponent) {
        super(visitedGraph, host);
    }

    tryGetRootVertex(): TryOutResult<TVertex> {
        if (this.hasRootVertex) {
            return {
                success: true,
                value: this.rootVertex!
            }
        }

        return { success: false};
    }

    setRootVertex(rootVertex: TVertex): void {
        const changed = getDefaultComparer(rootVertex).compare(this.rootVertex!, rootVertex) !== 0;
        this.rootVertex = rootVertex;
        if (changed) {
            this.onRootVertexChanged();
        }
        this.hasRootVertex = true;
    }
    public clearRootVertex(): void {
        this.rootVertex = undefined;
        this.hasRootVertex = false;
    }

    private readonly _rootVertexChanged: Subject<void> = new Subject<void>();
    public get rootVertexChanged(): Observable<void> {
        return this._rootVertexChanged.asObservable();
    }
    public onRootVertexChanged(): void {
        this._rootVertexChanged.next();
    }

    public compute(rootVertex?: TVertex) {
        if (rootVertex) {
            this.setRootVertex(rootVertex);
        }
        super.compute();
    }
}
