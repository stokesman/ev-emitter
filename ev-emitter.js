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
      /**
       * Applies so that the receiver can access `this`.
       * @todo Determine if this is more a bug than a feature. Does outlayer depend on it?
       */
      receiver.apply( this, event.detail );
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
   * @returns The instance.
   */
  on( type, receiver ) {
    this.#add( type, receiver );

    return this;
  }

  /**
   * Adds a callback on a signal for a single time.
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Function called when signal dispatches.
   * @returns The instance.
   */
  once( type, receiver ) {
    this.#add( type, receiver, true );

    return this;
  }

  /**
   * Removes a callback on a signal.
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Subscriber function.
   * @returns The instance.
   */
  off( type, receiver ) {
    const foundTypeMap = this.#receiverMap.get( receiver );
    if ( ! foundTypeMap ) return this;

    const relay = foundTypeMap.get( type );
    if ( relay ) {
      this.#core.removeEventListener( type, relay );
      foundTypeMap.delete( type );
      if ( foundTypeMap.size === 0 ) this.#receiverMap.delete( receiver );
    }

    return this;
  }

  /**
   * Sends a signal.
   * @param {string} type Name of signal.
   * @param {any[]} args Arguments to receiver.
   * @returns The instance.
   */
  emit( type, ...args ) {
    this.#core.dispatchEvent( new CustomEvent( type, { detail: args } ) );

    return this;
  }

  /**
   * Removes all signal callbacks.
   * @returns The instance.
   */
  reset() {
    this.#core = new EventTarget;
    this.#receiverMap = new Map;

    return this;
  }

  /**
   * Provides public methods.
   * @returns Public methods of a new instance.
   */
  static get mixin() {
    const { on, once, off, emit, reset } = new this;
    return { on, once, off, emit, reset };
  }
}
