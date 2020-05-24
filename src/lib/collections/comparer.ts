/**
 * Created by yish on 2020/05/10.
 */
import { IComparer } from "./interface";

/**
 * Provides a base class for implementations of the generic interface
 */
export class Comparer<T> implements IComparer<T> {
    public compare(x: T, y: T): number {
        if (x === y) {
            return 0;
        }
        return 1;
    }
}

export function getDefaultComparer<T>(obj: T): Comparer<T> {
    return new Comparer<T>();
}

