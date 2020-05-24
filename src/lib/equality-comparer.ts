/**
 * Created by yish on 2020/05/10.
 */
import {IEqualityComparer} from "./interface";

export class EqualityComparer<T> implements IEqualityComparer<T>{
    equals(x: T, y: T): boolean {
        return x === y;
    }

    getHashCode(v: T): number {
        return 0;
    }
}

