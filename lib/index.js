'use strict'

const Compiler = render.Compiler = require('./compiler')
const lazy = require('lazyrequire')(require)
const Parser = require('jade').Parser
const beautify = lazy('js-beautify')
const addWith = require('with')

module.exports = render

/**
 * Runtime included when you create a template.
 * You are expected to install these yourself.
 */

render.runtime = `
var h = require('virtual-dom/h');
`

/**
 * Variables that you don't want to bother `with`ing.
 */

render.globals = [
  'require',
]

/**
 * Compile the jade source into a function string with the signature:
 *
 * (locals) => VNode
 *
 * You are expected to `eval()` the result if you want an actual function.
 */

function render(str, options) {
  options = options || {}
  // TODO: remove this when i'm done debugging
  options.pretty = true

  let name = options.name || 'render'

  // parse
  let parser = new Parser(str)
  let tokens = parser.parse()

  // compile
  let compiler = new Compiler(tokens, options)

  // jade -> code
  let out = render.runtime + compiler.compile()

  // add locals
  out = addWith('locals', out, render.globals)

  // wrap in a function
  out = `function ${name}(locals) {${out}}`

  // beautify
  if (options.pretty) out = beautify().js_beautify(out, {
    indent_size: 2,
  })

  return out
}
