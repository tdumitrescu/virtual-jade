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

  this.hasLiteral = false
  this.hasObjAttrs = false
  this.mixins = []

  for (const node of this.node.nodes) {
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
    if (node.type === 'Mixin') {
      this.visitMixin(node)
    }
  }

  assert(tagged, 'Exactly a single root element is required!')

  if (this.hasObjAttrs) {
    js = `
      var __objToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      ${js}
    `
  }

  if (this.mixins.length > 0) {
    js = `var jade_mixins = {};${this.mixins.join('')}${js}`
  }

  if (this.hasLiteral) {
    js = `
      function generateLiteralWidget(contents) {
        function LiteralWidget(contents) {
          this.contents = contents
        }
        LiteralWidget.prototype.type = 'Widget'
        LiteralWidget.prototype.init = function () {
          const wrapper = document.createElement('div')
          wrapper.innerHTML = this.contents
          let root
          if (wrapper.childNodes.length === 1) {
            root = wrapper.firstChild
          } else {
            root = wrapper
          }
          return root
        }
        LiteralWidget.prototype.update = function (previous, domNode) {}
        LiteralWidget.prototype.destroy = function (domNode) {}
        // 'render' is called by the vdom-to-html module which is used in the unit tests
        LiteralWidget.prototype.render = function () {
          const h = require('virtual-dom/h')
          const host = document.createElement('div')
          host.appendChild(this.init())
          return h('text', host.innerHTML)
        }
        return new LiteralWidget(contents)
      };
      ${js}
    `
  }

  return js
}

/**
 * Visit a node, though this is really just meant for the first tag.
 */

Compiler.prototype.visit = function (node) {
  const method = 'visit' + node.type
  assert(typeof this[method] === 'function',
    `Node type "${node.type}" is not implemented!`)
  return this[method](node)
}

/**
 * TODO
 */

Compiler.prototype.visitComment =
Compiler.prototype.visitBlockComment = function (node) {
  if (!node.block) return `/* ${node.val} */\n`
  return '/* ' + node.block.nodes.map(toVal).join('\n') + '*/\n'
}

function toVal(x) {
  return x.val
}

/**
 * Create basic text nodes.
 */

Compiler.prototype.visitText = function (node) {
  return JSON.stringify(node.val)
    .replace(/#\{(.+?)\}/g, '" + ($1) + "')
}

/**
 * Handle a "Literal" include such as an SVG or HTML file
 */
Compiler.prototype.visitLiteral = function (node) {
  this.hasLiteral = true
  const escapedSource = node.str.replace(/'/g, '\\\'').replace(/\n/g, '')
  return 'generateLiteralWidget(\'' + escapedSource + '\')'
}

/**
 * Build a single HTML element.
 */

Compiler.prototype.visitTag = function (tag) {
  let buf = 'h(' + JSON.stringify(tag.name)
  const attrs = this.visitAttributes(tag.attrs, tag.attributeBlocks)
  if (attrs.length) {
    buf += `,${attrs}`
  }
  // TODO: handle cases when there is both code and blocks
  if (tag.code) {
    // NOTE: should we cast this to a String?
    // might be interesting to include another virtual-dom...
    buf += `, (${tag.code.val})`
  } else {
    let buf2 = this.visitBlock(tag.block)
    if (buf2) {
      // children must always be an array
      // https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md#arguments
      // TODO: test
      if (!/^\[.*\]$/.test(buf2)) buf2 = `[${buf2}]`
      buf += ', ' + buf2
    }
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
  const props = Object.create(null)
  const classExprs = []
  for (const attr of attrs) {
    const name = attr.name
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
        const isObj = !!val.match(/^\s*\{(.|[\r\n])+\}\s*$/)
        if (isObj) {
          this.hasObjAttrs = true
          val = `__objToAttrs(${val})`
        }
        classExprs.push(val)
        break
      }
      default:
        props[name] = val
    }
  }
  if (classExprs.length) {
    const classConcat = classExprs.map(e => `.concat(${e})`).join('')
    props.className = `[]${classConcat}.filter(Boolean).join(' ')`
  }

  debug('properties: %o', props)

  // we actually define the `properties` object
  let buf = ''
  for (const key of Object.keys(props)) {
    buf += JSON.stringify(key) + ':' + props[key] + ','
  }
  if (!buf) return ''
  return `{${buf}}`
}

Compiler.prototype.visitBlock = function (block, wrap) {
  const nodes = block.nodes
  const length = nodes.length
  if (!length) return ''

  let buf = ''

  // if there are non-control-flow code nodes, then construct array
  // by pushing one value at a time in output func
  const arrayPushMode = !!nodes.filter(n => n.type === 'Code').length

  for (let i = 0; i < nodes.length; i++) {
    let curNodeBuf = ''
    const node = nodes[i]
    switch (node.type) {
      case 'Code':
        assert(!/^\s*else/.test(node.val), 'Hanging else statement!')

        if (/^\s*if\s+/.test(node.val)) {
          // handle if statements
          let ended = false

          curNodeBuf += node.val.replace(/^\s*if\s+/, '')
          curNodeBuf += ` ? (${this.visitBlock(node.block)})`

          for (let j = i + 1; j < nodes.length; j++) {
            const next = nodes[j]
            if (/^\s*else\s+if\s+/.test(next.val)) {
              i++
              curNodeBuf += ' : ' + next.val.replace(/^\s*else\s+if\s+/, '')
              curNodeBuf += ` ? (${this.visitBlock(next.block)})`
            } else if (/^\s*else\s*$/.test(next.val)) {
              i++
              ended = true
              curNodeBuf += ` : (${this.visitBlock(next.block)})`
              break
            } else {
              break
            }
          }

          if (!ended) curNodeBuf += ' : undefined'
          buf += `__jade_nodes.push(${curNodeBuf});`
        } else if (/^\s*while/.test(node.val)) {
          // handle while loops
          curNodeBuf += `(function(){
            var buf = [];
            ${node.val} {
              buf = buf.concat(${this.visitBlock(node.block)})
            }
            return buf
          }).call(this)`
          buf += `__jade_nodes.push(${curNodeBuf});`
        } else if (node.val) {
          // arbitrary code
          buf += node.buffer ? `__jade_nodes.push(${node.val});` : `${node.val};`
        }

        break
      case 'Comment':
      case 'BlockComment':
        buf += this.visitComment(node)
        break
      default: {
        curNodeBuf = this.visit(node)
        assert(!!curNodeBuf, 'Node returned no compiled content')
        buf += arrayPushMode ? `__jade_nodes.push(${curNodeBuf});` : `${curNodeBuf},`
      }
    }
  }

  if (!buf) return ''

  if (arrayPushMode) {
    return `(function() {var __jade_nodes = [];${buf};return __jade_nodes}).call(this)`
  }

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
  let conditions = []

  for (const node of code.block.nodes) {
    if (node.expr === 'default') {
      defaulted = true
      str += `(${this.visitBlock(node.block)})`
      break
    }

    conditions.push(`((${code.expr}) == (${node.expr}))`)
    if (node.block) {
      str += `(${conditions.join(' || ')})
        ? (${this.visitBlock(node.block)})
        : `
      conditions = []
    }
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

/**
 * Handle mixin declarations and calls
 */

Compiler.prototype.visitMixin = function (mixin) {
  let str = ''
  let args = mixin.args || ''
  let rest = ''
  let initRest = ''

  if (mixin.call) {
    // mixin call
    let ctx
    const ctxItems = []
    if (mixin.block) {
      ctxItems.push(`block: function() { return ${this.visitBlock(mixin.block)}; }`)
    }
    if (mixin.attrs.length) {
      ctxItems.push('attributes: ' + this.visitAttributes(mixin.attrs))
    }
    if (ctxItems.length) {
      ctx = `{${ctxItems.join(',')}}`
    } else {
      ctx = 'this'
    }
    args && (args = `, ${args}`)
    str = `jade_mixins['${mixin.name}'].call(${ctx}${args})`
  } else {
    // mixin declaration
    args = args ? args.split(',') : []
    if (args.length && /^\.\.\./.test(args[args.length - 1].trim())) {
      rest = args.pop().trim().replace(/^\.\.\./, '')
    }
    if (rest) {
      initRest = `
        var ${rest} = [];
        for (var jade_interp = ${args.length}; jade_interp < arguments.length; jade_interp++) {
          ${rest}.push(arguments[jade_interp]);
        }
      `
    }
    this.mixins.push(`
      jade_mixins['${mixin.name}'] = function(${args.join(',')}) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        ${initRest}
        return ${this.visitBlock(mixin.block)};
      };
    `)
  }

  return str
}

/**
 * Handle mixin's `block` keyword
 */

Compiler.prototype.visitMixinBlock = function (block) {
  return 'block && block()'
}
