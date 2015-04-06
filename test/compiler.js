'use strict'

const Parser = require('jade').Parser
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const Compiler = require('../lib/compiler')

describe('Compiler', function () {
  it('should throw if there is not exactly 1 tag', function () {
    assert.throws(function () {
      testCompilation('root-if')
    })

    assert.throws(function () {
      testCompilation('empty')
    })

    assert.throws(function () {
      testCompilation('multiple-tags')
    })
  })

  it('should compile the boilerplate', function () {
    testCompilation('boilerplate')
  })

  it('should compile attributes', function () {
    let js = testCompilation('attributes')
    assert.equal(js.match(/"class"/).length, 1, 'More than one class property set.')
  })

  it('should compile if statements', function () {
    let js = testCompilation('if')
  })

  it('should compile case statements', function () {
    let js = testCompilation('case')
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
