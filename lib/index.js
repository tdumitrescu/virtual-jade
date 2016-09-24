'use strict'

const Compiler = render.Compiler = require('./compiler')
const lazy = require('lazyrequire')(require)
const Parser = require('jade').Parser
const rethrow = require('jade').runtime.rethrow
const beautify = lazy('js-beautify')
const addWith = require('with')

module.exports = render

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {
  'snabbdom': {
    runtime: `var h = require('snabbdom/h');`,
  },
  'virtual-dom': {
    runtime: `var h = require('virtual-dom/h');`,
  },
}

/**
 * Variables that you don't want to bother `with`ing.
 */
render.globals = [
  'require',
]

/**
 * Default renderer options.
 */
const DEFAULT_OPTIONS = {
  name: 'render',
  vdom: 'virtual-dom',
}

/**
 * Compile the jade source into a function string with the signature:
 *
 * (locals) => VNode
 *
 * You are expected to `eval()` the result if you want an actual function.
 */
function render(str, options) {
  options = Object.assign({}, options, DEFAULT_OPTIONS)

  const name = options.name
  const vdom = VDOM_CONFIG[options.vdom]
  const runtime = options.runtime || vdom.runtime

  // parse
  const ParserCls = options.parser || Parser
  const parser = new ParserCls(str, options.filename)
  let tokens
  try {
    tokens = parser.parse()
  } catch (err) {
    const context = parser.context()
    rethrow(err, context.filename, context.lexer.lineno, context.input)
  }

  // compile
  const compiler = new Compiler(tokens, options)

  // jade -> code
  let out = runtime
  try {
    out += compiler.compile()
  } catch (err) {
    rethrow(err, err.filename, err.line, parser.input)
  }

  // add locals
  out = addWith('locals', out, render.globals)

  // wrap in a function
  out = `
    function ${name}(locals) {
      locals = locals || {};
      ${out}
    }
  `

  // beautify
  if (options.pretty) {
    out = beautify().js_beautify(out, { indent_size: 2 })
  }

  return out
}
