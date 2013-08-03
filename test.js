var inherits = require('inherits')
var bindle = require('./')
var test = require('tape')

function baseEntity() {
  function Entity() {
    bindle.call(this)
    this.trigger('init')
  }
  inherits(Entity, bindle)
  return Entity
}

test('hello world', function(t) {
  var Entity = baseEntity()
  var ok = false

  bindle.mixin().on('init', function() {
    ok = true
  })(Entity)

  new Entity
  t.ok(ok, 'mixin works')
  t.end()
})

test('mixins do not clash', function(t) {
  t.plan(1)

  var A = baseEntity()
  var B = baseEntity()
  var a = false

  bindle.mixin().on('init', function() {
    a = true
  })(A)

  bindle.mixin().on('init', function() {
    t.ok(!a, 'no clash')
  })(B)

  new B
})

test('multiple mixins (same trigger)', function(t) {
  var Entity = baseEntity()
  var n = 0

  bindle.mixin().on('init', function() {
    n += 1
  })(Entity)

  bindle.mixin().on('init', function() {
    n += 1
  })(Entity)

  bindle.mixin().on('init', function() {
    t.equal(n, 2)
    t.end()
  })(Entity)

  new Entity
})

test('multiple mixins (different triggers)', function(t) {
  var Entity = baseEntity()
  var n = 0

  Entity.prototype.tick = function() { this.trigger('tick') }
  Entity.prototype.draw = function() { this.trigger('draw') }
  Entity.prototype.done = function() { this.trigger('done') }

  bindle.mixin().on('init', function() {
    t.equal(n++, 0)
  })(Entity)

  bindle.mixin().on('tick', function() {
    t.equal(n++, 1)
  })(Entity)

  bindle.mixin().on('draw', function() {
    t.equal(n++, 2)
  })(Entity)

  bindle.mixin().on('done', function() {
    t.equal(n++, 3)
    t.end()
  })(Entity)

  var e = new Entity
  e.tick()
  e.draw()
  e.done()
})

test('multiple instances', function(t) {
  var Entity = baseEntity()
  var ents = []
  var n = 0

  bindle.mixin().on('init', function() {
    this.n = n++
  })(Entity)

  ents.push(new Entity())
  ents.push(new Entity())
  ents.push(new Entity())

  t.ok(ents[0].n === 0, 'first')
  t.ok(ents[1].n === 1, 'second')
  t.ok(ents[2].n === 2, 'third')
  t.end()
})

test('mixin events exist on the shallowest prototype', function(t) {
  var Entity = baseEntity()

  function SpecialEntity() {}
  inherits(SpecialEntity, Entity)

  bindle.mixin().on('init', function(){})(Entity)
  bindle.mixin().on('draw', function(){})(SpecialEntity)

  t.ok(Entity.prototype.hasOwnProperty('_bindle'), 'parent has own _bindle')
  t.ok(Entity.prototype._bindle.hasOwnProperty('init'), 'parent has init')
  t.ok(!Entity.prototype._bindle.hasOwnProperty('draw'), 'parent does not have draw')

  t.ok(SpecialEntity.prototype.hasOwnProperty('_bindle'), 'child has own _bindle')
  t.ok(SpecialEntity.prototype._bindle.hasOwnProperty('draw'), 'child has draw')
  t.ok(!SpecialEntity.prototype._bindle.hasOwnProperty('init'), 'child does not have init')

  t.end()
})

test('trigger arguments', function(t) {
  var Entity = baseEntity()
  t.plan(14)

  for (var i = 0; i < 7; i += 1) (function(i) {
    bindle.mixin().on(String(i), function() {
      t.equal(arguments.length, i)
      t.ok(this === ent, 'correct context')
    })(Entity)
  })(i)

  var ent = new Entity
  ent.trigger('0')
  ent.trigger('1', 1)
  ent.trigger('2', 1, 2)
  ent.trigger('3', 1, 2, 3)
  ent.trigger('4', 1, 2, 3, 4)
  ent.trigger('5', 1, 2, 3, 4, 5)
  ent.trigger('6', 1, 2, 3, 4, 5, 6)
})
