var inherits = require('inherits')

module.exports = Bindle
function Bindle() {}

/**
 * Triggers are stored on the `_bindle` property
 * of an object prototype.
 *
 * @type {Object}
 */
Bindle.prototype._bindle = {}

/**
 * Used to trigger events on Bindle instances,
 * which are defined/attached using Bindle.mixin().
 *
 * @param  {String} event The event name.
 */
Bindle.prototype.trigger = function(event, a, b, c, d) {
  var triggers = this._bindle[event]
  if (!triggers) return this
  var i = triggers.length
  var j

  // Call is faster than apply, and slicing the
  // arguments allocates memory, so handle events with
  // 0-4 arguments to cover the most common cases.
  switch (arguments.length) {
    case 1: while(i--) triggers[i].call(this); return this
    case 2: while(i--) triggers[i].call(this, a); return this
    case 3: while(i--) triggers[i].call(this, a, b); return this
    case 4: while(i--) triggers[i].call(this, a, b, c); return this
    case 5: while(i--) triggers[i].call(this, a, b, c, d); return this
  }

  var len = arguments.length
  var args = new Array(len - 1)
  for (j = 1; j < len; j += 1) {
    args[j - 1] = arguments[i]
  }

  while (i--) {
    triggers[i].apply(this, args)
  }

  return this
}

/**
 * Use to define a mixin, which can be applied to any class
 * descended from Bindle.
 *
 * @return {Function} The mixin
 */
Bindle.mixin = function() {
  var handlers = []
  var names = []

  mixin.on = on

  function mixin(Child) {
    var proto = Child.prototype

    if (!proto.hasOwnProperty('_bindle')) {
      proto._bindle = {}
    }

    names.forEach(function(key, i) {
      proto._bindle[key] = proto._bindle[key] || []
      proto._bindle[key].unshift(handlers[i])
    })

    return Child
  }

  function on(name, handler) {
    names.push(name)
    handlers.push(handler)
    return mixin
  }

  return mixin
}
