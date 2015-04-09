'use strict'

/**
 * Compilation style.
 *
 * We rely on minification, so don't bother with styling.
 * For example, trailling commas on object and arrays are _preferred_.
 *
 * We rely on beautification for "pretty" mode,
 * so don't bother handling indentations and so on.
 */

const debug = require('debug')('virtual-jade:compiler')
const assert = require('assert')

module.exports = Compiler

function Compiler(node, options) {
  this.node = node
  this.options = options
}

/**
 * Actually compile the tokens.
 * We want to match the Jade API as much as possible here.
 */

Compiler.prototype.compile = function () {
  let tagged = null
  let js = ''

  for (let node of this.node.nodes) {
    if (node.type === 'Tag') {
      assert(!tagged, 'You can only have one top-level tag!')
      tagged = true
      js += 'return ' + this.visitTag(node)
      continue
    }
    if (node.type === 'Code') {
      assert(!tagged, 'Code must exist before the tag.')
      js += node.val + '\n'
      continue
    }
  }

  assert(tagged, 'Exactly a single root element is required!')

  return js
}

/**
 * Visit a node, though this is really just meant for the first tag.
 */

Compiler.prototype.visit = function (node) {
  let method = 'visit' + node.type
  assert(typeof this[method] === 'function',
    `Node type "${node.type}" is not implemented!`)
  return this[method](node)
}

/**
 * TODO
 */

Compiler.prototype.visitComment =
Compiler.prototype.visitBlockComment = function () {
  return ''
}

/**
 * Create basic text nodes.
 */

Compiler.prototype.visitText = function (node) {
  return JSON.stringify(node.val)
}

/**
 * Build a single HTML element.
 */

Compiler.prototype.visitTag = function (tag) {
  let buf = 'h(' + JSON.stringify(tag.name)
  buf += this.visitAttributes(tag.attrs, tag.attributeBlocks)
  // TODO: handle cases when there is both code and blocks
  if (tag.code) {
    // NOTE: should we cast this to a String?
    // might be interesting to include another virtual-dom...
    buf += `, (${tag.code.val})`
  } else if (tag.block) {
    let buf2 = this.visitBlock(tag.block)
    if (buf2) buf += ', ' + buf2
  }
  buf += ')'
  return buf
}

/**
 * Visit each attribute in a tag.
 * Note that each property of the attribute is already JS-ready,
 * so don't just JSON.stringify() the entire thing.
 * Also, `virtual-dom` handles properties differently.
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
       * it can be defined multiple times.
       * Also, `virtual-dom` requires classes to be
       * a `.className` property.
       */

      case 'class':
      case 'className': {
        let isArray = /\s*\[.*\]\s*$/.test(val)
        if (props.className) {
          if (isArray) {
            val = val.replace(/^\s*\[/, ', ')
          } else {
            val = ', ' + val + ']'
          }
          props.className = props.className.replace(/\]\s*$/, '') + val
        } else {
          if (!isArray) val = '[' + val + ']'
          props.className = val
        }
        break
      }
      default:
        props[name] = val
    }
  }

  // classes are not expected to be an array, so combine them
  if (props.className) props.className += `.filter(Boolean).join(' ')`

  debug('properties: %o', props)

  // we actually define the `properties` object
  let buf = ''
  for (let key of Object.keys(props)) {
    buf += JSON.stringify(key) + ':' + props[key] + ','
  }
  if (!buf) return ''
  return `,{${buf}}`
}

Compiler.prototype.visitBlock = function (block, wrap) {
  let nodes = block.nodes
  let length = nodes.length
  if (!length) return ''

  let buf = ''

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i]
    switch (node.type) {
      case 'Code':
        assert(!/^\s*else/.test(node.val), 'Hanging else statement!')

        // handle if statements
        if (/^\s*if\s+/.test(node.val)) {
          let ended = false

          buf += node.val.replace(/^\s*if\s+/, '')
          buf += ` ? (${this.visitBlock(node.block)})`

          for (let j = i + 1; j < nodes.length; j++) {
            let next = nodes[j]
            if (/^\s*else\s+if\s+/.test(next.val)) {
              i++
              buf += ' : ' + next.val.replace(/^\s*else\s+if\s+/, '')
              buf += ` ? (${this.visitBlock(next.block)})`
            } else if (/^\s*else\s*$/.test(next.val)) {
              i++
              ended = true
              buf += ` : (${this.visitBlock(next.block)})`
              break
            } else {
              break
            }
          }

          if (!ended) buf += ' : undefined'
          buf += ','
        }

        // handle while loops
        if (/^\s*while/.test(node.val)) {
          buf += `(function(){
            var buf = [];
            ${node.val} {
              buf = buf.concat(${this.visitBlock(node.block)})
            }
            return buf
          }).call(this),`
          break
        }
        break
      default: {
        let str = this.visit(node)
        if (str) buf += str + ','
      }
    }
  }

  if (!buf) return ''
  // single value, so remove the trailing comma
  if (length === 1) return buf.replace(/\,$/, '')
  // array of values
  return `[${buf}]`
}

/**
 * Handles jade's special case statements,
 * which breaks it down into a bunch of `if` statements.
 *
 * TODO: maybe memoize the main expression
 */

Compiler.prototype.visitCase = function (code) {
  let str = ''
  let defaulted = false

  for (let node of code.block.nodes) {
    if (node.expr === 'default') {
      defaulted = true
      str += `(${this.visitBlock(node.block)})`
      break
    }

    str += `((${code.expr}) == (${node.expr}))
      ? (${this.visitBlock(node.block)})
      : `
  }

  if (!defaulted) str += 'undefined'
  return str
}

/**
 * Handle each statements
 */

Compiler.prototype.visitEach = function (code) {
  return `(${code.obj}).map(function (${code.val}, ${code.key}) {
    return ${this.visitBlock(code.block)}
  })`
}
