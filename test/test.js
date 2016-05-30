'use strict'

const toHTML = require('vdom-to-html')
const parse5 = require('parse5-utils')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const render = require('..')

function renderFixture(fixtureName, locals) {
  const fn = eval(`(${render(fixture(fixtureName))})`)
  const root = fn.call({class: 'asdf'}, locals)
  const html = toHTML(root)
  parse5.parse(html, true)
  return html
}

describe('Render', function () {
  it('should render a template', function () {
    const html = renderFixture('item', {
      item: {
        id: '1234',
        title: 'some title',
        description: 'some description',
        active: true,
      }
    })

    assert(~html.indexOf('item active'))
    assert(~html.indexOf('class="title"'))
    assert(~html.indexOf('<h3'))
    assert(~html.indexOf('</h3>'))
    assert(~html.indexOf('some title'))
    assert(~html.indexOf('some description'))
  })

  it('should beautify when option is set', function () {
    const fn = render(fixture('item'), {pretty: true})
    const lines = fn.split('\n')
    assert(lines.length > 15)
    assert(lines[lines.length - 1].trim() === '}')
  })

  it('should run while loops correctly', function () {
    const html = renderFixture('while')
    assert(html.match(/<div class=\"item\">/g).length === 5)
  })

  describe('attributes', function () {
    it('should add arbitrary attributes', function () {
      const html = renderFixture('attributes')
      assert(html.includes('required'))
      assert(!html.includes('something'))
    })

    it('should add class attributes in array notation', function () {
      let html = renderFixture('attributes')
      assert(html.includes('1 2'))
      html = renderFixture('attributes', {variable: 'meow'})
      assert(html.includes('1 2 meow'))
    })

    it('should add class attributes in object notation', function () {
      let html = renderFixture('attributes')
      assert(html.includes('obj1'))
      assert(!html.includes('obj2'))

      html = renderFixture('attributes', {variable: 'doge'})
      assert(html.includes('obj1'))
      assert(html.includes('obj2'))
    })

    it('should combine class attributes in different notations gracefully', function () {
      let html = renderFixture('attributes')
      assert(html.includes('mixed'))
      assert(html.includes('mixedArray1'))
      assert(!html.includes('mixedObj1'))

      html = renderFixture('attributes', {var2: 'doge'})
      assert(html.includes('mixed'))
      assert(html.includes('mixedArray1'))
      assert(html.includes('mixedObj1'))
      assert(html.includes('doge'))
    })
  })

  describe('case statements', function () {
    it('should not execute any cases when none match', function () {
      const html = renderFixture('case')
      assert(!html.includes('foo'))
      assert(!html.includes('bar'))
    })

    it('should execute default when no others match', function () {
      const html = renderFixture('case')
      assert(html.includes('llama'))
    })

    it('should execute only one match', function () {
      const html = renderFixture('case', {variable: 1})
      assert(html.includes('span'))
      assert(!html.includes('input'))
      assert(!html.includes('textarea'))
    })

    it('should fall through from the first case in a chain', function () {
      const html = renderFixture('case', {variable2: 'd'})
      assert(html.includes('bar'))
      assert(!html.includes('foo'))
    })

    it('should fall through from the middle case in a chain', function () {
      const html = renderFixture('case', {variable2: 'e'})
      assert(html.includes('bar'))
      assert(!html.includes('foo'))
    })

    it('should fall through from the last case in a chain', function () {
      const html = renderFixture('case', {variable2: 'f'})
      assert(html.includes('bar'))
      assert(!html.includes('foo'))
    })
  })

  describe('code blocks', function() {
    it('should run unbuffered code correctly', function () {
      const html = renderFixture('code')
      assert(~html.indexOf('<div class="example bar">'))
    })

    it('should use locals when evaluating', function () {
      let html = renderFixture('code', {x: 0})
      assert(~html.indexOf('<div class="baz">'))
      html = renderFixture('code', {x: -1})
      assert(!~html.indexOf('<div class="baz">'))
    })

    it('should output inline buffered code', function () {
      const html = renderFixture('code')
      assert(html.includes('<div class="inline-script"><div class="raw-inline">within another div'))
    })

    it('should output standalone buffered code', function () {
      const html = renderFixture('code')
      assert(html.includes('<div class="raw-buffered">raw so raw'))
    })

    it('should not output unbuffered code', function () {
      const html = renderFixture('code')
      assert(!html.includes('should not be output'))
    })
  })
})

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures/' + name + '.jade'), 'utf8')
}
