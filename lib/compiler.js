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

Compiler.prototype.compile = function () {
  let node = this.node
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

Compiler.prototype.visit = function (node, wrap) {
  let method = 'visit' + node.type
  assert(typeof this[method] === 'function', 'Node type "' + node.type + '" not implemented!')
  return this[method](node, wrap)
}

/**
 * We intentionally do not support comments.
 * How would this work?
 */

Compiler.prototype.visitComment =
Compiler.prototype.visitBlockComment = function () {
  return false
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
  if (tag.block) {
    buf += this.visitBlock(tag.block)
  }
  buf += ')'
  return buf
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
  let buf = ''
  for (let key of Object.keys(props)) {
    buf += JSON.stringify(key) + ':' + props[key] + ','
  }
  if (!buf) return ''
  return `,{${buf}}`
}

Compiler.prototype.visitBlock = function (block, wrap) {
  let buf = ''
  let nodes = block.nodes
  top:
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i]
    switch (node.type) {
      case 'Code':
        // handle if statements
        if (/^\s*if\s+/.test(node.val)) {
          let ended = false

          buf += node.val.replace(/^\s*if\s+/, '')
          buf += ` ? ([${this.visitBlock(node.block, false)}])`

          for (let j = i + 1; j < nodes.length; j++) {
            let next = nodes[j]
            if (/^\s*else\s+if\s+/.test(next.val)) {
              i++
              buf += ' : ' + next.val.replace(/^\s*else\s+if\s+/, '')
              buf += ` ? ([${this.visitBlock(next.block, false)}])`
            } else if (/^\s*else\s*$/.test(next.val)) {
              i++
              ended = true
              buf += ` : ([${this.visitBlock(next.block, false)}])`
              break
            } else {
              break
            }
          }

          if (!ended) buf += ' : undefined'
          buf += ','
        }
        break
      default: {
        let str = this.visit(node)
        if (str) buf += str + ','
      }
    }
  }
  if (!buf) return ''
  if (wrap !== false) return `,[${buf}]`
  return buf.replace(/\,$/, '')
}

/**
 * Handles:
 *
 * - if statements
 * - variable declarations
 */

Compiler.prototype.visitCode = function (code) {
  // console.log(code)
}

/**
 * Handles jade's special case statements.
 */

Compiler.prototype.visitCase = function (code) {
  // console.log(code)
}
