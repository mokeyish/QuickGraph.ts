/**
 * Created by yish on 2020/05/24.
 */


import { Queue } from './queue';

describe('Queue', () => {
    it('count', () => {
        const queue = new Queue<string>();
        expect(queue.count).toEqual(0);
        queue.enqueue('a');
        expect(queue.count).toEqual(1);
        queue.dequeue();
        expect(queue.count).toEqual(0);
    })

    it('contains', () => {
        const queue = new Queue<string>();
        queue.enqueue('a');
        queue.enqueue('b');
        expect(queue.contains('b')).toEqual(true);
        expect(queue.contains('c')).toEqual(false);
    })

    it('enqueue/dequeue', () => {
        const queue = new Queue<string>();
        queue.enqueue('a');
        queue.enqueue('b');
        expect(queue.dequeue()).toEqual('a');
    })

    it('peek', () => {
        const queue = new Queue<string>();
        queue.enqueue('a');
        queue.enqueue('b');
        expect(queue.peek()).toEqual('a');
        expect(queue.count).toEqual(2);
    })

    it('peek', () => {
        const queue = new Queue<string>();
        queue.enqueue('a');
        queue.enqueue('b');
        expect(queue.toArray()).toEqual(['a', 'b'])
    })
})
