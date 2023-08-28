/* eslint-disable jsdoc/require-jsdoc */
import assert from 'node:assert';
import test from 'node:test';

import EvEmitter from '../ev-emitter.js';

test( 'emits signal', () => {
  let emitter = new EvEmitter;
  let didPop;
  emitter.on( 'pop', () => {
    didPop = true;
  } );
  emitter.emit('pop');
  assert( didPop, 'signal emitted' );
} );

test( 'emits signal with arguments forwarded to receiver', () => {
  let emitter = new EvEmitter;
  let result;
  /** @type {(argOne: number, argTwo: number)=>void} */
  function onPop( argOne, argTwo ) {
    result = [ argOne, argTwo ];
  }
  emitter.on( 'pop', onPop );
  emitter.emit( 'pop', 1, 2 );
  assert.deepStrictEqual( result, [ 1, 2 ], 'signal emitted, arguments passed' );
} );

test( 'emits signal to applied receiver so it is bound to this', () => {
  let getThis = () => {};
  let extender = new class extends EvEmitter {
    onPop() {
      getThis = () => this;
    }
  };
  extender.on( 'pop', extender.onPop );
  extender.emit('pop');
  assert.strictEqual( getThis(), extender, 'signal emitted, receiver’s this is signaler' );
} );

test( 'does not add identical receiver for same signal', () => {
  const emitter = new EvEmitter;
  let ticks = 0;
  const onPop = () => ticks++;
  emitter.on( 'pop', onPop );
  emitter.on( 'pop', onPop );
  const _onPop = onPop;
  emitter.on( 'pop', _onPop );

  emitter.emit('pop');
  assert.strictEqual( ticks, 1, '1 tick for same receiver' );
} );

test( 'Adds identical receiver for different signals', () => {
  const emitter = new EvEmitter;
  let ticks = 0;
  const onPop = () => ticks++;
  emitter.on( 'pop', onPop );
  emitter.on( 'popOff', onPop );
  const _onPop = onPop;
  emitter.on( 'pop', _onPop );
  emitter.on( 'popOff', _onPop );

  emitter.emit('pop');
  emitter.emit('popOff');
  assert.strictEqual( ticks, 2, '2 ticks for different signals with same receivers' );
} );

test( 'removes receiver with off()', () => {
  let emitter = new EvEmitter;
  let ticks = 0;
  const onPop = () => {
    ticks++;
  }
  emitter.on( 'pop', onPop );
  emitter.emit('pop');
  emitter.off( 'pop', onPop );
  emitter.emit('pop');
  assert.strictEqual( ticks, 1, '.off() removed receiver' );
 
  // reset
  /** @type {string[]} */
  let ary = [];
  ticks = 0;
  emitter.reset();

  const onPopA = () => {
    ticks++;
    ary.push('a');
    if ( ticks == 2 ) {
      emitter.off( 'pop', onPopA );
    }
  }
  const onPopB = () => {
    ary.push('b');
  }

  emitter.on( 'pop', onPopA );
  emitter.on( 'pop', onPopB );
  emitter.emit('pop'); // a,b
  emitter.emit('pop'); // a,b - remove onPopA
  emitter.emit('pop'); // b

  assert.strictEqual( ary.join(','), 'a,b,a,b,b', '.off in receiver does not interfer' );
} );

test( 'signals receivers added with once() a single time', () => {
  let emitter = new EvEmitter;
  /** @type {string[]} */
  let ary = [];

  emitter.on( 'pop', () => {
    ary.push('a');
  } );
  emitter.once( 'pop', () => {
    ary.push('b');
  } );
  emitter.on( 'pop', () => {
    ary.push('c');
  } );
  emitter.emit('pop');
  emitter.emit('pop');

  assert.strictEqual( ary.join(','), 'a,b,c,a,c', 'once receiver triggered once' );

  /** @todo does the rest of this really cover anything that’s not already covered? */
  // reset
  emitter.reset();
  ary = [];

  // add two receivers with the same effect on one with once().
  emitter.on( 'pop', () => {
    ary.push('a');
  } );
  emitter.once( 'pop', () => {
    ary.push('a');
  } );
  emitter.emit('pop');
  emitter.emit('pop');

  assert.strictEqual( ary.join(','), 'a,a,a',
      'receivers with the same effect do not interfere' );
} );

test( 'does not infinite loop in once()', () => {
  let emitter = new EvEmitter;
  let ticks = 0;
  emitter.once( 'pop', () => {
    ticks++;
    if ( ticks < 4 ) {
      emitter.emit('pop');
    }
  } );
  emitter.emit('pop');
  assert.strictEqual( ticks, 1, '1 tick with emit in once' );
} );

test( 'handles emit with no receivers', () => {
  let emitter = new EvEmitter;
  assert.doesNotThrow( () => {
    emitter.emit( 'pop', [ 1, 2, 3 ] );
  } );

  const onPop = () => {};

  emitter.on( 'pop', onPop );
  emitter.off( 'pop', onPop );

  assert.doesNotThrow( () => {
    emitter.emit( 'pop', [ 1, 2, 3 ] );
  } );

  emitter.on( 'pop', onPop );
  emitter.emit( 'pop', [ 1, 2, 3 ] );
  emitter.off( 'pop', onPop );

  assert.doesNotThrow( () => {
    emitter.emit( 'pop', [ 1, 2, 3 ] );
  } );
} );

test( 'removes all receivers after reset', () => {
  let emitter = new EvEmitter;
  /** @type {string[]} */
  let ary = [];
  emitter.on( 'pop', () => {
    ary.push('a');
  } );
  emitter.on( 'pop', () => {
    ary.push('b');
  } );
  emitter.once( 'pop', () => {
    ary.push('c');
  } );

  emitter.emit('pop');
  emitter.reset();
  emitter.emit('pop');

  assert.strictEqual( ary.join(','), 'a,b,c', 'reset removed receivers' );
} );

/**
 * @todo Beyond these basic extenstion tests that follow it'd be cool to group all the
 * tests above into a group and test all for each extenstion method.
 */

test( 'class extends', () => {
  class Widgey extends EvEmitter {}

  let wijjy = new Widgey;

  assert.strictEqual( typeof wijjy.on, 'function' );
  assert.strictEqual( typeof wijjy.off, 'function' );
  assert.strictEqual( typeof wijjy.once, 'function' );
} );

test( 'Object.assign prototype', () => {
  function Thingie() {}
  Object.assign( Thingie.prototype, EvEmitter.mixin );

  // @ts-ignore
  let thing = new Thingie;

  assert.strictEqual( typeof thing.on, 'function' );
  assert.strictEqual( typeof thing.off, 'function' );
  assert.strictEqual( typeof thing.once, 'function' );
} );
