'use strict'

const assert = require('assert')
const fs = require('fs')
const jsdom = require('mocha-jsdom')
const parse5 = require('parse5-utils')
const path = require('path')
const toHTML = require('vdom-to-html')

const render = require('..')

function renderFixture(fixtureName, locals) {
  const compiled = render(fixture(fixtureName), {
    filename: fixtureFilename(fixtureName),
  })
  const fn = eval(`(${compiled})`)
  const root = fn.call({class: 'asdf'}, locals)
  const html = toHTML(root)
  parse5.parse(html, true)
  return html
}

describe('Render', function () {
  jsdom();

  it('should throw a parser error with filename and line number when rendering a broken template', function () {
    const file = 'break-parser'
    const filename = fixtureFilename(file)
    const compile = function () {
      render(fixture(file), {filename})
    }
    let threw = false

    try {
      compile()
    } catch (err) {
      threw = true
      const filenameAndLineNo = new RegExp(filename.replace('/','\/') + ":2")
      assert(err.path == filename, 'err.path should be the full path to the jade file')
      assert(err.message.match(filenameAndLineNo), 'the error message should contain the full path and line number')
      assert(err.message.match(/Unexpected identifier/), 'the error message should contain the error type')
    } finally {
      assert(threw, 'an error should be thrown')
    }
  })

  it('should throw a compiler error with filename and line number when rendering a broken template', function () {
    const file = 'break-compiler'
    const filename = fixtureFilename(file)
    const compile = function () {
      render(fixture(file), {filename})
    }
    let threw = false

    try {
      compile()
    } catch (err) {
      threw = true
      const filenameAndLineNo = new RegExp(filename.replace('/','\/') + ":2")
      assert(err.path == filename, 'err.path (' + err.path + ') should be the full path to the jade file')
      assert(err.message.match(filenameAndLineNo), 'the error message should contain the full path and line number')
      assert(err.message.match(/You can only have one top-level tag!/), 'the error message should contain the error type')
    } finally {
      assert(threw, 'an error should be thrown')
    }
  })

  it('should render a template without options', function () {
    const compiled = render(fixture('attributes'))
    assert(compiled.includes('class1'))
    assert(compiled.includes('foo'))
    assert(compiled.includes('doge'))
  })

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

  it('should insert dynamic tag names', function () {
    let html = renderFixture('dynamic-tag', {myTag: 'input'})
    assert(html.includes('<input class="llamas">'))
    html = renderFixture('dynamic-tag', {myTag: 'textarea'})
    assert(html.includes('<textarea class="llamas">'))
  })

  describe('multiple files', function () {
    it('should insert included files', function () {
      const html = renderFixture('include')
      assert(html.includes('<p>Hello</p>'))
      assert(html.includes('<div class="included-content">llamas!!!</div>'))
      assert(html.includes('<p>world</p>'))
    })

    it('should make included mixins available', function () {
      const html = renderFixture('include-with-mixin')
      assert(html.includes('<div class="foo">'))
      assert(html.includes('<div class="hello">insert me</div>'))
    })

    it('should insert included literal (non-jade) files', function () {
      const html = renderFixture('literal-import')
      const singleRootImport = '<div class="test">test</div>'
      const multiRootImport = '<div>child 1</div><div>child 2</div>'
      const htmlEntities = function(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      }
      const expectedContents =
        '<div class="raw">' +
          '<div class="single-root">' +
            '<text>' + htmlEntities(singleRootImport) + '</text>' +
          '</div>' +
          '<div class="multi-root">' +
            '<text>' + htmlEntities('<div>' + multiRootImport + '</div>') + '</text>' +
          '</div>' +
        '</div>'
      assert(html === expectedContents)
    })

    it('should insert extended files', function () {
      const html = renderFixture('extends')
      assert(html.includes('<div class="foo">'))
      assert(html.includes('capybara'))
      assert(html.includes('default content'))
    })
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

    it('should render data attributes', function () {
      const html = renderFixture('attributes', {variable: 'capybara'})
      assert(html.includes('data-foo-id="42"'))
      assert(html.includes('data-var="capybara"'))
    })

    it('should convert attributes to correct property names', function () {
      const html = renderFixture('attributes')
      assert(html.includes('autocomplete="on"'))
      assert(html.includes('tabindex="5"'))
      assert(html.includes('for="special-attr"'))
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
    let html;

    beforeEach(function () {
      html = renderFixture('code')
    })

    it('should run unbuffered code correctly', function () {
      assert(~html.indexOf('<div class="example bar">'))
    })

    it('should use locals when evaluating', function () {
      html = renderFixture('code', {x: 0})
      assert(~html.indexOf('<div class="baz">'))

      html = renderFixture('code', {x: -1})
      assert(!~html.indexOf('<div class="baz">'))
    })

    it('should output inline buffered code', function () {
      assert(html.includes('<div class="inline-script"><div class="raw-inline">within another div'))
    })

    it('should output standalone buffered code', function () {
      assert(html.includes('<div class="raw-buffered">raw so raw'))
    })

    it('should not output unbuffered code', function () {
      assert(!html.includes('should not be output'))
    })
  })
})


function fixtureFilename(name) {
  return path.resolve(__dirname, 'fixtures/' + name + '.jade')
}

function fixture(name) {
  return fs.readFileSync(fixtureFilename(name), 'utf8')
}
