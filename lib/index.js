'use strict';

const Compiler = require(`./compiler`);
const lazy = require(`lazyrequire`)(require);
const Parser = require(`jade`).Parser;
const rethrow = require(`jade`).runtime.rethrow;
const beautify = lazy(`js-beautify`);
const addWith = require(`with`);

const VDOM_CONFIG = require(`./config`).VDOM_CONFIG;

/**
 * Variables that you don't want to bother `with`ing.
 */
const GLOBALS = [
  `Boolean`,
  `require`,
];

/**
 * Default renderer options.
 */
const DEFAULT_OPTIONS = {
  name: `render`,
  vdom: `virtual-dom`,
};

/**
 * Compile the jade source into a function string with the signature:
 *
 * (locals) => VNode
 *
 * You are expected to `eval()` the result if you want an actual function.
 */
function render(str, options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);
  if (!VDOM_CONFIG[options.vdom]) {
    throw new Error(`No virtual-jade config found for vdom type: ${options.vdom}`);
  }

  const name = options.name;
  const runtime = options.runtime || VDOM_CONFIG[options.vdom].runtime;

  // parse
  const ParserCls = options.parser || Parser;
  const parser = new ParserCls(str, options.filename);
  let tokens;
  try {
    tokens = parser.parse();
  } catch (err) {
    const context = parser.context();
    rethrow(err, context.filename, context.lexer.lineno, context.input);
  }

  // compile
  const compiler = new Compiler(tokens, options);

  // jade -> code
  let out = runtime;
  try {
    out += compiler.compile();
  } catch (err) {
    rethrow(err, err.filename, err.line, parser.input);
  }

  // add locals
  out = addWith(`locals`, out, GLOBALS);

  // wrap in a function
  out = `
    function ${name}(locals) {
      locals = locals || {};
      ${out}
    }
  `;

  // beautify
  if (options.pretty) {
    out = beautify().js_beautify(out, { indent_size: 2 }); // eslint-disable-line camelcase
  }

  return out;
}

render.Compiler = Compiler;


module.exports = render;
