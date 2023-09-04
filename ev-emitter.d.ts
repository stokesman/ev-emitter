/**
 * @template {Array<any>} [A=any[]] Arguments
 * @typedef {(...args: A) => void} Receiver
 */
/**
 * Succinct pub/sub pattern.
 */
export default class EvEmitter {
    /**
     * @template {(...args:any[]) => any} T
     * @typedef {Parameters<T> extends never[] ? never[] : Parameters<T>} OptionalRest
     */
    /**
     * @template {keyof EvEmitter} K
     * @typedef {(this: EvEmitter, ...args: OptionalRest<EvEmitter[K]> ) => ReturnType<EvEmitter[K]>} BoundMethod
     */
    /** @typedef {{[Key in keyof EvEmitter]: BoundMethod<Key>}} EvEmitterMixin */
    /**
     * Provides methods that can be assigned to an object to replicate the public interface
     * of EvEmitter. These are expected to be assigned to individual instances instead of
     * to a `prototype` as that will produce instances that share state.
     * @returns Methods bound to a new instance.
     */
    static get mixin(): {
        on: (this: EvEmitter, type: string, receiver: Receiver<any[]>) => void;
        once: (this: EvEmitter, type: string, receiver: Receiver<any[]>) => void;
        off: (this: EvEmitter, type: string, receiver: Receiver<any[]>) => void;
        emit: (this: EvEmitter, type: string, ...args: any[]) => void;
        reset: (this: EvEmitter, ...args: never[]) => void;
    };
    /**
     * Adds a callback on a signal.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Function called when signal dispatches.
     */
    on(type: string, receiver: Receiver): void;
    /**
     * Adds a callback on a signal for a single time.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Function called when signal dispatches.
     */
    once(type: string, receiver: Receiver): void;
    /**
     * Removes a callback on a signal.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Subscriber function.
     */
    off(type: string, receiver: Receiver): void;
    /**
     * Sends a signal.
     * @param {string} type Name of signal.
     * @param {any[]} args Arguments to receiver.
     */
    emit(type: string, ...args: any[]): void;
    /**
     * Removes all signal callbacks.
     */
    reset(): void;
    #private;
}
export type Receiver<A extends any[] = any[]> = (...args: A) => void;
//# sourceMappingURL=ev-emitter.d.ts.map