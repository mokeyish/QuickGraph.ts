/**
 * Created by yish on 2020/05/10.
 */
import { IAlgorithmComponent, IAlgorithmServices, ICancelManager } from "./interface";
import { CANCEL_MANAGER } from "./cancel-manager";

export class AlgorithmServices implements IAlgorithmServices{
    private _cancelManager?: ICancelManager;

    constructor(private readonly host: IAlgorithmComponent) { }


    public get cancelManager(): ICancelManager {
        if (!this._cancelManager) {
            this._cancelManager = this.host.getService(CANCEL_MANAGER);
        }
        return this._cancelManager;
    }
}
