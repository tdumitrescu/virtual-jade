'use strict'

const Parser = require('jade').Parser
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const Compiler = require('../lib/compiler')

describe('Compiler', function () {
  it('should compile the boilerplate', function () {
    let js = testCompilation('boilerplate')
    console.log(js)
  })

  it('should compile attributes', function () {
    let js = testCompilation('attributes')
    // it should only define `class:` once!
    assert.equal(js.match(/"class"/).length, 1)
    console.log(js)
  })
})

function testCompilation(fixture_name) {
  let parser = new Parser(fixture(fixture_name))
  let tokens = parser.parse()
  let compiler = new Compiler(tokens, {
    pretty: true
  })
  let js = compiler.compile()
  // make sure it's syntactically valid
  new Function(js)
  return js
}

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures/' + name + '.jade'), 'utf8')
}
