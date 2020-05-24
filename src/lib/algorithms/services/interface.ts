/**
 * Created by yish on 2020/05/10.
 */
import { EventHandler } from "../../event";
import { InjectionToken } from "../../di/injection-token";
import { Type } from "../../di/type";
import { TryOutResult } from "../../try-result";

export interface IService {}

export interface ICancelManager
    extends IService{

    /**
     * Raised when the cancel method is called
     */
    readonly cancelRequested: EventHandler;

    /**
     * Requests the component to cancel its computation
     */
    cancel(): void;

    /**
     * Gets a value indicating if a cancellation request is pending.
     */
    readonly isCancelling: boolean;

    /**
     * Raised when the cancel state has been reseted
     */
    readonly cancelReseted: EventHandler;

    /**
     * Resets the cancel state
     */
    resetCancel(): void;
}

/**
 * Common services available to algorithm instances
 */
export interface IAlgorithmServices {
    readonly cancelManager: ICancelManager;
}


export interface IAlgorithmComponent {
    readonly services: IAlgorithmServices;
    getService<T extends IService>(t: Type<T> | InjectionToken<T>): T;
    tryGetService<T extends IService>(t: Type<T> | InjectionToken<T>): TryOutResult<T>;
}



