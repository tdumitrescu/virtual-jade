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

  it('should run code blocks correctly', function () {
    const html = renderFixture('code')
    assert(~html.indexOf('<div class="example bar">'))
  })

  it('should run while loops correctly', function () {
    const html = renderFixture('while')
    assert(html.match(/<div class=\"item\">/g).length === 5)
  })
})

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures/' + name + '.jade'), 'utf8')
}
