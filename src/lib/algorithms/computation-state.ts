/**
 * Created by yish on 2020/05/10.
 */

/**
 * The computation state of a graph algorithm
 */
export enum ComputationState {

    /**
     * The algorithm is not running
     */
    NotRunning,

    /**
     * The algorithm is running
     */
    Running,

    /**
     * An abort has been requested. The algorithm is still running and will cancel as soon as it checks
     * the cancelation state
     */
    PendingAbortion,

    /**
     * The computation is finished succesfully.
     */
    Finished,

    /**
     * The computation was aborted
     */
    Aborted
}
