/**
 * @template {Array<any>} [A=any[]] Arguments
 * @typedef {(...args: A) => void} Receiver
 */

/**
 * Succinct pub/sub pattern.
 */
export default class EvEmitter {
  #core = new EventTarget;

  /** @type {Map<Receiver, Map<string, (event: Event) => void>>} */
  #receiverMap = new Map;

  /**
   * @param {string} type
   * @param {Receiver} receiver
   * @param {boolean} once
   * @returns An EventListener.
   */
  #makeRelay( type, receiver, once ) {
    return /** @type {EventListener} */(( /** @type {CustomEvent} */ event ) => {
      if ( once ) this.off( type, receiver );
      receiver( ...event.detail );
    } );
  }

  /**
   * @param {string} type
   * @param {Receiver} receiver
   * @param {boolean} [once]
   */
  #add( type, receiver, once = false ) {
    if ( !type || !receiver ) return;

    const foundTypeMap = this.#receiverMap.get( receiver );
    if ( foundTypeMap?.has( type ) ) return;

    const relay = this.#makeRelay( type, receiver, once )
    if ( ! foundTypeMap )
      this.#receiverMap.set( receiver, new Map( [[ type, relay ]] ) );
    else foundTypeMap.set( type, relay )
    this.#core.addEventListener( type, relay, once && { once: true } );
  }

  /**
   * Adds a callback on a signal.
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Function called when signal dispatches.
   */
  on( type, receiver ) {
    this.#add( type, receiver );
  }

  /**
   * Adds a callback on a signal for a single time.
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Function called when signal dispatches.
   */
  once( type, receiver ) {
    this.#add( type, receiver, true );
  }

  /**
   * Removes a callback on a signal.
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Subscriber function.
   */
  off( type, receiver ) {
    const foundTypeMap = this.#receiverMap.get( receiver );
    if ( ! foundTypeMap ) return;

    const relay = foundTypeMap.get( type );
    if ( relay ) {
      this.#core.removeEventListener( type, relay );
      foundTypeMap.delete( type );
      if ( foundTypeMap.size === 0 ) this.#receiverMap.delete( receiver );
    }
  }

  /**
   * Sends a signal.
   * @param {string} type Name of signal.
   * @param {any[]} args Arguments to receiver.
   */
  emit( type, ...args ) {
    this.#core.dispatchEvent( new CustomEvent( type, { detail: args } ) );
  }

  /**
   * Removes all signal callbacks.
   */
  reset() {
    this.#core = new EventTarget;
    this.#receiverMap = new Map;
  }

  /* eslint-disable jsdoc/valid-types */
  /**
   * @template {(...args:any[]) => any} T
   * @typedef {Parameters<T> extends never[] ? never[] : Parameters<T>} OptionalRest
   */
  /* eslint-enable jsdoc/valid-types */

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
  static get mixin() {
    const instance = new this;
    /** @type {Partial<EvEmitterMixin>} */
    const mixin = {};
    for ( const key of /** @type {(keyof EvEmitter)[]}*/([ 'on', 'once', 'off', 'emit', 'reset' ]) )
      mixin[ key ] = instance[ key ].bind( instance );

    return /** @type {EvEmitterMixin} */(mixin);
  }
}
