/**
 * @template {Array<any>} [A=any[]] Arguments
 * @typedef {(...args: A) => void} Receiver
 */
/**
 * Succinct pub/sub pattern.
 */
export default class EvEmitter {
    /**
     * Provides public methods.
     * @returns Public methods of a new instance.
     */
    static get mixin(): {
        on: (type: string, receiver: Receiver<any[]>) => EvEmitter;
        once: (type: string, receiver: Receiver<any[]>) => EvEmitter;
        off: (type: string, receiver: Receiver<any[]>) => EvEmitter;
        emit: (type: string, ...args: any[]) => EvEmitter;
        reset: () => EvEmitter;
    };
    /**
     * Adds a callback on a signal.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Function called when signal dispatches.
     * @returns The instance.
     */
    on(type: string, receiver: Receiver): this;
    /**
     * Adds a callback on a signal for a single time.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Function called when signal dispatches.
     * @returns The instance.
     */
    once(type: string, receiver: Receiver): this;
    /**
     * Removes a callback on a signal.
     * @param {string} type Name of signal.
     * @param {Receiver} receiver Subscriber function.
     * @returns The instance.
     */
    off(type: string, receiver: Receiver): this;
    /**
     * Sends a signal.
     * @param {string} type Name of signal.
     * @param {any[]} args Arguments to receiver.
     * @returns The instance.
     */
    emit(type: string, ...args: any[]): this;
    /**
     * Removes all signal callbacks.
     * @returns The instance.
     */
    reset(): this;
    #private;
}
export type Receiver<A extends any[] = any[]> = (...args: A) => void;
//# sourceMappingURL=ev-emitter.d.ts.map