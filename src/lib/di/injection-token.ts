/**
 * Created by yish on 2020/05/10.
 */

export class InjectionToken<T> {
    constructor(private readonly desc?: string, private readonly factory?: () => T) {
    }

    create(): T | undefined {
        if (this.factory) {
            return this.factory()
        }
    }

    toString(): string {
        return `InjectionToken ${this.desc}`;
    }
}
