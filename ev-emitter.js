/**
 * @template {Array<any>} [A=any[]] Arguments
 * @typedef {(...args: A) => void} Receiver
 */

/**
 * @todo
 * It would be neat if there were a way to support typing of signals and their receivers
 * arguments. That way langauge servers could suggest and verify signals and arguments.
 * 
 * @see https://43081j.com/2020/11/typed-events-in-typescript
 */

/**
 * A succinct signaling interface piggybacked on the EventTarget API.
 */
export default class {
  #core = new EventTarget;

  /** @type {Map<Receiver, Map<string, (event: Event) => void>>} */
  #receiverMap = new Map;

  /**
   * @param {string} type
   * @param {Receiver} receiver
   * @param {boolean} once
   */
  #makeRelay( type, receiver, once ) {
    return /** @type {EventListener} */(( /** @type CustomEvent */ event ) => {
      if ( once ) this.off( type, receiver );
      /**
       * Applies so that the receiver can access `this`.
       * @todo Determine if this is more a bug than a feature. Does outlayer depend on it?
       */
      receiver.apply( this, event.detail );
    })
  }

  /**
   * @param {string} type
   * @param {Receiver} receiver
   * @param {boolean} [once]
   */
  #add( type, receiver, once = false ) {
    if ( !type || !receiver ) return;

    const foundTypeMap = this.#receiverMap.get( receiver );
    // bails when a relay exists for the type.
    if ( foundTypeMap?.has( type ) ) return;

    const relay = this.#makeRelay( type, receiver, once )
    if ( ! foundTypeMap )
      this.#receiverMap.set( receiver, new Map( [ [ type, relay ] ] ) );
    else foundTypeMap.set( type, relay )
    this.#core.addEventListener( type, relay, once && { once: true } );
  }

  /**
   * Adds a callback on a signal.
   * 
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Function called when signal dispatches.
   */
  on( type, receiver ) {
    this.#add( type, receiver );

    return this;
  }

  /**
   * Adds a callback on a signal for a single time.
   * 
   * @param {string} type Name of signal.
   * @param {Receiver} receiver Function called when signal dispatches.
   */
  once( type, receiver ) {
    this.#add( type, receiver, true );

    return this;
  }

  /**
   * Removes a callback on a signal.
   * 
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

    return this;
  }

  /**
   * Sends a signal.
   * 
   * @param {string} type Name of signal.
   * @param {any[]} args Arguments to receiver.
   */
  emit( type, ...args ) {
    this.#core.dispatchEvent( new CustomEvent( type, { detail: args } ) );

    return this;
  }

  /**
   * Removes all signal callbacks.
   */
  reset() {
    this.#core = new EventTarget;
    this.#receiverMap = new Map;

    return this;
  }

  static get mixin() {
    const { on, once, off, emit, reset } = new this
    return { on, once, off, emit, reset };
  }
}
