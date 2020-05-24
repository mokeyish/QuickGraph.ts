/**
 * Created by yish on 2020/05/10.
 */

export type TryOutResult<T> = TryFailure | TrySuccess<T>;

type TryFailure = {
    success: false
}
type TrySuccess<T> = {
    success: true
    value: T
}
