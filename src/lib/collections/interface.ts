/**
 * Created by yish on 2020/05/10.
 */

/**
 * Exposes a method that compares two objects.
 */
export interface IComparer<T> {
    compare(x: T, y: T): number;
}
