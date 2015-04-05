'use strict'

const debug = require('debug')('virtual-jade:compiler')
const lazy = require('lazyrequire')(require)
const beautify = lazy('js-beautify')

module.exports = Compiler

function Compiler(node, options) {
  this.node = node
  this.options = options

  this.options.pretty = true

  this.buf = [
    'return ',
  ]
}

Compiler.prototype.compile = function () {
  this.visit(this.node, true)
  // console.log(JSON.stringify(this.buf.join(''), null, 2))
  let js = this.buf.join('')

  if (this.options.pretty) js = beautify().js_beautify(js, {
    indent_size: 2
  })

  console.log(js)

  return js
}

Compiler.prototype.visit = function (node, wrap) {
  return this['visit' + node.type](node, wrap)
}

Compiler.prototype.visitDoctype = function () {
  throw new Error('Unsupported node type: Doctype')
}

Compiler.prototype.visitComment =
Compiler.prototype.visitBlockComment = function () {
  return false
}

Compiler.prototype.visitText = function (node) {
  this.buf.push('VText(' + JSON.stringify(node.val) + ')')
  return true
}

Compiler.prototype.visitTag = function (tag) {
  this.buf.push('h(' + JSON.stringify(tag.name) + ',')
  this.visitAttributes(tag.attrs, tag.attributeBlocks)
  if (tag.block) {
    this.buf.push(',')
    this.visitBlock(tag.block)
  } else if (tag.code) {

  } else {

  }
  this.buf.push(')')
  return true
}

/**
 * Visit each attribute in a tag.
 * Note that each property of the attribute is already JS-ready,
 * so don't just JSON.stringify() the entire thing.
 */

Compiler.prototype.visitAttributes = function (attrs) {
  // first, we need to format the attributes
  let props = Object.create(null)
  for (let attr of attrs) {
    let name = attr.name
    let val = attr.val
    switch (name) {
      /**
       * We need to handle `class` separately because
       * it can be defined multiple times
       */

      case 'class': {
        let isArray = /\s*\[.*\]\s*$/.test(val)
        if (props.class) {
          if (isArray) {
            val = val.replace(/^\s*\[/, ', ')
          } else {
            val = ', ' + val + ']'
          }
          props.class = props.class.replace(/\]\s*$/, '') + val
        } else {
          if (!isArray) val = '[' + val + ']'
          props.class = val
        }
        break
      }
      default:
        props[name] = val
    }
  }

  debug('properties: %o', props)

  // we actually define the `properties` object
  this.buf.push('{')
  for (let key of Object.keys(props)) {
    this.buf.push(JSON.stringify(key), ':', props[key], ',')
  }
  this.buf.push('}')

  return true
}

Compiler.prototype.visitBlock = function (block, wrap) {
  this.buf.push('[')
  for (let node of block.nodes)
    if (this.visit(node))
      this.buf.push(',')
  this.buf.push(']')

}

Compiler.prototype.visitCode = function (code) {

}
