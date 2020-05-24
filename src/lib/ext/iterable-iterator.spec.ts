/**
 * Created by yish on 2020/05/10.
 */

import './iterable-iterator';

describe('IterableIterator', () => {
    it('skip', () => {
        const v = ['a', 'b', 'c'];
        const v1 = v.values().skip(2).toArray();
        expect(v1.length).toEqual(1);
        expect(v1[0]).toEqual('c');
    })

    it('skipWhile', () => {
        const v = ['a', 'b', 'c'];
        const v1 = v.values().skipWhile((s) => s == 'b').toArray();
        expect(v1.length).toEqual(1);
        expect(v1[0]).toEqual('c');
    })

    it('take', () => {
        const v = ['a', 'b', 'c'];
        const v1 = v.values().take(2).toArray();
        expect(v1.length).toEqual(2);
        expect(v1[0]).toEqual('a');
        expect(v1[1]).toEqual('b');
    })

    it('takeWhile', () => {
        const v = ['a', 'b', 'c'];
        const v1 = v.values().takeWhile(c => c == 'b').toArray();
        expect(v1.length).toEqual(2);
        expect(v1[0]).toEqual('a');
        expect(v1[1]).toEqual('b');
    })
})
