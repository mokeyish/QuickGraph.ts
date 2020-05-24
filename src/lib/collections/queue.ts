/**
 * Created by yish on 2020/05/24.
 */
import { IQueue } from './interface';


export class Queue<T> implements IQueue<T>{
    private entries: T[] = [];
    public get count(): number {
        return this.entries.length;
    }

    contains(value: T): boolean {
        return this.entries.findIndex(o => o === value) > -1;
    }

    dequeue(): T | undefined {
        const v = this.peek();
        if (this.entries.length > 0) {
            this.entries.splice(0, 1);
        }
        return v;
    }

    enqueue(value: T): void {
        this.entries.push(value);
    }

    peek(): T | undefined {
        if (this.entries.length > 0) {
            return this.entries[0];
        }
        return undefined;
    }

    toArray(): T[] {
        return new Array(...this.entries);
    }
}
