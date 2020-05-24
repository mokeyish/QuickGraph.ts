/**
 * Created by yish on 2020/05/10.
 */


export class List<T> extends Array<T> {

    public get count(): number {
        return this.length;
    }
    add(v: T): boolean {
        return this.push(v) === 1;
    }

    remove(v: T): boolean {
        return false;
    }

    clear(): void {
    }

    contains(v: T): boolean {
        return this.indexOf(v) > -1;
    }

    trimExcess(): void {
    }
}
