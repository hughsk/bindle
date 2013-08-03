# bindle [![experimental](https://rawgithub.com/hughsk/stability-badges/master/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Bindle is an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) for JavaScript *"classes"*. It's most
suitable as the base of an entity/component system - not to be used directly,
but the little ~1-2kB of functionality you need to build upon.

## Why? ##

EventEmitters are a great tool, but unfortunately they cost you memory:
each emitter has to listen to each event, so each one will have something like
this attached to the instance:

``` javascript
{
  _events: {
      data: [function(){}, function(){}]
    , tick: [function(){}]
    , draw: [function(){}]
  }
}
```

Which is fine when you're only dealing with small scenes, but if your
instantiating large numbers of emitters in a short time frame you may
need to be conservative. Even if you're careful to reuse listener functions,
each one still has to store an index of events unique to that emitter.

So: stick them on the `prototype`!

...I'm yet to confirm whether this a good idea, so use with caution.

## Installation ##

``` bash
npm install bindle
```

## Usage ##

Take a very simple base class, extended with Bindle:

``` javascript
var Bindle = require('bindle')
  , inherits = require('inherits')

function Entity() {
  Bindle.call(this)
  this.trigger('init')
}
inherits(Entity, Bindle)

Entity.prototype.tick = function() {
  this.trigger('tick')
}
```

`Bindle.mixin` will create and return a mixin function, which can define
additional "trigger" events:

``` javascript
var physical = Bindle.mixin()
  .on('init', function() {
    this.position = { x: 0, y: 0 }
    this.speed = { x: 1, y: -1 }
  })
  .on('tick', function() {
    this.position.x += this.speed.x
    this.position.y += this.speed.y
  })
```

You can then call this on any class extended with Bindle to include its
functionality:

``` javascript
physical(Entity)

var entity = new Entity
entity.tick()
entity.tick()
entity.tick()
entity.position.x // +3
entity.position.y // -3
```

It's also easy to combine EventEmitters and Bindles too:

``` javascript
var EventEmitter = require('events').EventEmitter
  , inherits = require('inherits')
  , Bindle = require('bindle')

function Entity() {
  EventEmitter.call(this)
  Bindle.call(this)

  this.emit('init')
  this.trigger('init')
}
inherits(Entity, EventEmitter)
inherits(Entity, Bindle)
```

## API ##

### `Bindle = require('bindle')` ###

Bindle's class definition.

### `mixin = Bindle.mixin([properties])` ###

Returns a mixin function that can be applied to a Bindle class. Optionally,
you can supply a properties object - these properties will be added to the
class' prototype when applying the mixin.

### `mixin.on(event, handler)` ###

Include a trigger response in the mixin - once defined, if the instance class
`this.trigger(event)`, `handler` will get called from the instance's context.

### `mixin(Class)` ###

Apply the mixin to a class.

### `instance = new Class()` ###
### `instance.trigger(event[, args...])` ###

Equivalent to `EventEmitter`'s `emit` method - will trigger events named
`event`, passing the arguments to each listener.
