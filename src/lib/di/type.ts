/**
 * Created by yish on 2020/05/10.
 */

export declare const Type: FunctionConstructor;

export declare interface Type<T> extends Function {
    new (...args: any[]): T;
}
