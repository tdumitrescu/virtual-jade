'use strict'

const Compiler = render.Compiler = require('./compiler')
const Parser = require('jade').Parser
const addWith = require('with')

module.exports = render

function render(str, options) {
  options = options || {}
  options.compiler = Compiler

  // jade -> code
  let out = jade.render(str, options)

  //
}
