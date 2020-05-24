/**
 * Created by yish on 2020/05/10.
 */
import { IAlgorithm } from './interface';
import { IAlgorithmComponent, IAlgorithmServices, IService } from './services/interface';
import { Observable, Subject } from 'rxjs';
import { Type } from '../di/type';
import { TryOutResult } from '../try-result';
import { InjectionToken } from '../di/injection-token';
import { ComputationState } from './computation-state';
import { AlgorithmServices } from './services/algorithm-services';

export abstract class AlgorithmBase<TGraph>
    implements IAlgorithm<TGraph>, IAlgorithmComponent {
    private readonly _visitedGraph: TGraph;
    private readonly _services: IAlgorithmServices;
    private _state: ComputationState = ComputationState.NotRunning;
    private readonly _aborted: Subject<void> = new Subject<void>();
    private readonly _finished: Subject<void> = new Subject<void>();
    private readonly _started: Subject<void> = new Subject<void>();
    private readonly _stateChanged: Subject<void> = new Subject<void>();

    protected constructor(visitedGraph: TGraph, host?: IAlgorithmComponent, ) {
        if (!host) {
            host = this;
        }
        this._visitedGraph = visitedGraph;
        this._services = new AlgorithmServices(host);
    }

    public get visitedGraph(): TGraph {
        return this._visitedGraph;
    }

    public get services(): IAlgorithmServices {
        return this._services;
    }

    public get state(): ComputationState {
        return this._state;
    }
    public get aborted(): Observable<void> {
        return this._aborted.asObservable();
    }
    public get finished(): Observable<void> {
        return this._finished.asObservable();
    }
    public get started(): Observable<void> {
        return this._started.asObservable();
    }
    public get stateChanged(): Observable<void> {
        return this._stateChanged.asObservable();
    }

    abort(): void {
        let raise = false;
        if (this._state === ComputationState.Running) {
            this._state = ComputationState.Aborted;
            this.services.cancelManager.cancel();
            raise = true;
        }

        if (raise) {
            this.onStateChanged();
        }
    }

    compute(): void {
        this.beginComputation();
        this.initialize();
        try {
            this.internalCompute();
        } finally {
            this.clean();
        }
        this.endComputation();
    }

    getService<T extends IService>(t: Type<T> | InjectionToken<T>): T {
        const result = this.tryGetService(t);
        if (!result.success) {
            throw new Error('service not found');
        }
        return result.value;
    }

    private _servicesMap?: Map<Type<any> | InjectionToken<any>, any>;
    tryGetService<T extends IService>(t: Type<T> | InjectionToken<T>): TryOutResult<T> {
        if (!this._servicesMap) {
            this._servicesMap = new Map<Type<any> | InjectionToken<any>, any>();
        }
        let service = this._servicesMap.get(t);

        if (!service) {
            service = (t as InjectionToken<T>).create();
            this._servicesMap.set(t,  service);
        } else {
            this._servicesMap.set(t, null);
        }
        return {
            success: !!service,
            value: service
        };
    }

    protected beginComputation(): void {
        this._state = ComputationState.Running;
        this._services.cancelManager.resetCancel();
        this.onStarted();
        this.onStateChanged();
    }
    protected endComputation(): void {
        switch (this._state) {
            case ComputationState.Running:
            case ComputationState.PendingAbortion:
                this._state = ComputationState.Aborted;
                this.onAborted();
                break;
            default:
                throw new Error('InvalidOperationException');
        }

        this._services.cancelManager.resetCancel();
        this.onStateChanged();
    }

    protected initialize(): void { }
    protected clean(): void { }
    protected internalCompute(): void { }

    protected onStarted(): void {
        this._started.next();
    }
    protected onAborted(): void {
        this._aborted.next();
    }
    protected onFinished(): void {
        this._finished.next();
    }
    protected onStateChanged(): void {
        this._stateChanged.next();
    }

}
