'use strict'

const toHTML = require('vdom-to-html')
const parse5 = require('parse5-utils')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const render = require('..')

describe('Render', function () {
  it('should render a template', function () {
    let fn = eval(`(${render(fixture('item'))})`)
    let locals = {
      item: {
        id: '1234',
        title: 'some title',
        description: 'some description',
        active: true,
      }
    }
    let root = fn.call({
      class: 'asdf',
    }, locals)
    let html = toHTML(root)
    parse5.parse(html, true)
  })
})

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures/' + name + '.jade'), 'utf8')
}
