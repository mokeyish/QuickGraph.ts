/**
 * Created by yish on 2020/05/10.
 */
import { ICancelManager } from "./interface";
import { Observable, Subject } from "rxjs";
import { EventHandler } from "../../event";
import { InjectionToken } from "../../di/injection-token";


export const CANCEL_MANAGER = new InjectionToken<ICancelManager>('CANCEL_MANAGER', () => new CancelManager());

export class CancelManager implements ICancelManager {
    private cancelling: number = 0;
    private _cancelRequested: Subject<void> = new Subject<void>();
    private _cancelReseted: Subject<void> = new Subject<void>();
    public get cancelRequested(): EventHandler {
        return this._cancelRequested.asObservable();
    }
    public get cancelReseted(): Observable<void> {
        return this._cancelReseted.asObservable();
    }
    public get isCancelling(): boolean {
        return this.cancelling > 0;
    }

    cancel(): void {
    }

    resetCancel(): void {
    }

}
