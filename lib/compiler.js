'use strict';

const VDOM_CONFIG = require(`./config`).VDOM_CONFIG;

/**
 * Compilation style.
 *
 * We rely on minification, so don't bother with styling.
 * For example, trailling commas on object and arrays are _preferred_.
 *
 * We rely on beautification for "pretty" mode,
 * so don't bother handling indentations and so on.
 */

const debug = require(`debug`)(`virtual-jade:compiler`);

function assertWithDetailedError(node, assertion, message) {
  if (!assertion) {
    const err = new Error(message);
    err.line = node.line;
    err.filename = node.filename;
    throw err;
  }
}

let literalWidgetCount = 0;

function Compiler(node, options) {
  this.node = node;
  this.options = options;
  this.vdom = VDOM_CONFIG[options.vdom || `virtual-dom`];
  this.marshalDataset = this.vdom.dataset;
  if (this.options.hasOwnProperty(`marshalDataset`)) {
    this.marshalDataset = this.options.marshalDataset;
  }
  if (this.options.propsWrapper) {
    this.propsWrapper = this.options.propsWrapper;
  }
}

/**
 * Actually compile the tokens.
 * We want to match the Jade API as much as possible here.
 */

Compiler.prototype.compile = function() {
  let tagged = null;
  let js = ``;

  this.hasLiteral = false;
  this.hasObjAttrs = false;
  this.mixins = [];

  for (const node of this.node.nodes) {
    switch (node.type) {
      case `Block`:
        this.visitBlock(node);
        break;
      case `Code`:
        assertWithDetailedError(node, !tagged, `Code must exist before the tag.`);
        js += node.val + `\n`;
        break;
      case `Mixin`:
        this.visitMixin(node);
        break;
      case `Tag`:
        assertWithDetailedError(node, !tagged, `You can only have one top-level tag!`);
        tagged = true;
        js += `return ` + this.visitTag(node);
        break;
    }
  }

  assertWithDetailedError(this.node, tagged, `Exactly a single root element is required!`);

  if (this.hasObjAttrs) {
    js = `
      var __objToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      ${js}
    `;
  }

  if (this.mixins.length > 0) {
    js = `var jade_mixins = {};${this.mixins.join(``)}${js}`;
  }

  if (this.hasLiteral) {
    js = `
      function generateLiteralWidget(id, contents) {
        function LiteralWidget(id, contents) {
          this.name = 'LiteralWidget'
          this.id = id
          this.contents = contents
        }
        LiteralWidget.prototype.type = 'Widget'
        LiteralWidget.prototype.init = function () {
          var wrapper = document.createElement('div')
          wrapper.innerHTML = this.contents
          var root
          if (wrapper.childNodes.length === 1) {
            root = wrapper.firstChild
          } else {
            root = wrapper
          }
          return root
        }
        LiteralWidget.prototype.update = function (previous, domNode) {
          return domNode
        }
        // 'render' is called by the vdom-to-html module which is used in the unit tests
        LiteralWidget.prototype.render = function () {
          var h = require('virtual-dom/h')
          var host = document.createElement('div')
          host.appendChild(this.init())
          return h('text', host.innerHTML)
        }
        return new LiteralWidget(id, contents)
      };
      ${js}
    `;
  }

  return js;
};

/**
 * Visit a node, though this is really just meant for the first tag.
 */

Compiler.prototype.visit = function(node) {
  const method = `visit` + node.type;
  assertWithDetailedError(node,
    typeof this[method] === `function`,
    `Node type "${node.type}" is not implemented!`);
  return this[method](node);
};

/**
 * TODO
 */

function toVal(x) {
  return x.val;
}

Compiler.prototype.visitComment =
Compiler.prototype.visitBlockComment = function(node) {
  if (!node.block) return `/* ${node.val} */\n`;
  return `/* ` + node.block.nodes.map(toVal).join(`\n`) + `*/\n`;
};

/**
 * Create basic text nodes.
 */

Compiler.prototype.visitText = function(node) {
  return JSON.stringify(node.val)
    .replace(/#\{(.+?)\}/g, `" + ($1) + "`);
};

/**
 * Handle a "Literal" include such as an SVG or HTML file
 */
Compiler.prototype.visitLiteral = function(node) {
  this.hasLiteral = true;
  const escapedSource = node.str.replace(/'/g, `\\'`).replace(/\n/g, ``);
  const id = literalWidgetCount++;
  return `generateLiteralWidget(${id}, '${escapedSource}')`;
};

/**
 * Build a single HTML element.
 */

Compiler.prototype.visitTag = function(tag) {
  let buf = `h(` + (tag.buffer ? `(${tag.name})` : JSON.stringify(tag.name));
  let propsOut = this.visitAttributes(tag.attrs, tag.attributeBlocks);
  if (propsOut.length) {
    if (this.propsWrapper) {
      // e.g. {foo: 'bar'} => {props: {foo: 'bar'}}
      propsOut = `{${this.propsWrapper}:${propsOut}}`;
    }
    buf += `,${propsOut}`;
  }
  // TODO: handle cases when there is both code and blocks
  if (tag.code) {
    // NOTE: should we cast this to a String?
    // might be interesting to include another virtual-dom...
    buf += `, [(${tag.code.val})]`;
  } else {
    let buf2 = this.visitBlock(tag.block);
    if (buf2) {
      buf += `, ${buf2.trim()}.filter(Boolean)`;
    }
  }
  buf += `)`;
  return buf;
};

/**
 * Visit each attribute in a tag.
 * Note that each property of the attribute is already JS-ready,
 * so don't just JSON.stringify() the entire thing.
 * Also, `virtual-dom` handles properties differently.
 */

// attribute -> property transformations
const ATTRS_TO_PROPS = {
  'class': `className`,
  'for': `htmlFor`,
  'http-equiv': `httpEquiv`,
};
const LOWERCASE_ATTRS = new Set([
  `acceptCharset`,
  `accessKey`,
  `allowFullScreen`,
  `allowTransparency`,
  `cellPadding`,
  `cellSpacing`,
  `colSpan`,
  `contentEditable`,
  `contextMenu`,
  `crossOrigin`,
  `dateTime`,
  `formAction`,
  `formEncType`,
  `formMethod`,
  `formNoValidate`,
  `formTarget`,
  `frameBorder`,
  `marginHeight`,
  `marginWidth`,
  `maxLength`,
  `mediaGroup`,
  `noValidate`,
  `readOnly`,
  `rowSpan`,
  `tabIndex`,
  `useMap`,
]);
for (const a of LOWERCASE_ATTRS) {
  ATTRS_TO_PROPS[a.toLowerCase()] = a;
}

// convert this-type-of-string to thisTypeOfString
function dashedToCamel(s) {
  return s.replace(/-([a-z])/g, group => group[1].toUpperCase());
}

// JSON-stringify keys but not vals, for JS evaluation in output
function outputObj(obj) {
  let buf = ``;
  for (const key of Object.keys(obj)) {
    buf += JSON.stringify(key) + `:` + obj[key] + `,`;
  }
  return buf ? `{${buf}}` : ``;
}

Compiler.prototype.visitAttributes = function(attrs) {
  // first, we need to format the attributes
  const props = Object.create(null);
  const classExprs = [];
  const dataset = {};
  for (const attr of attrs) {
    const name = ATTRS_TO_PROPS[attr.name] || attr.name;
    let val = attr.val;

    if (name === `className`) {
      /**
       * We need to handle `class` separately because
       * it can be defined multiple times.
       */
      const isObj = !!val.match(/^\s*\{(.|[\r\n])+\}\s*$/);
      if (isObj) {
        this.hasObjAttrs = true;
        val = `__objToAttrs(${val})`;
      }
      classExprs.push(val);
    } else if (this.marshalDataset !== false && name.startsWith(`data-`)) {
      // strip data- and camelcase remainder for dataset
      dataset[dashedToCamel(name.slice(5))] = val;
    } else {
      props[name] = val;
    }
  }
  if (classExprs.length) {
    const classConcat = classExprs.map(e => `.concat(${e})`).join(``);
    props.className = `[]${classConcat}.filter(Boolean).join(' ')`;
  }
  if (Object.keys(dataset).length) {
    props.dataset = outputObj(dataset);
  }

  debug(`properties: %o`, props);

  return outputObj(props);
};

Compiler.prototype.visitBlock = function(block) {
  const nodes = block.nodes;
  const length = nodes.length;
  if (!length) return ``;

  let buf = ``;

  for (let i = 0; i < nodes.length; i++) {
    let curNodeBuf = ``;
    const node = nodes[i];
    switch (node.type) {
      case `Code`:
        assertWithDetailedError(node, !/^\s*else/.test(node.val), `Hanging else statement!`);

        if (/^\s*if\s+/.test(node.val)) {
          // handle if statements
          let ended = false;

          curNodeBuf += node.val.replace(/^\s*if\s+/, ``);
          curNodeBuf += ` ? (${this.visitBlock(node.block)})`;

          for (let j = i + 1; j < nodes.length; j++) {
            const next = nodes[j];
            if (/^\s*else\s+if\s+/.test(next.val)) {
              i++;
              curNodeBuf += ` : ` + next.val.replace(/^\s*else\s+if\s+/, ``);
              curNodeBuf += ` ? (${this.visitBlock(next.block)})`;
            } else if (/^\s*else\s*$/.test(next.val)) {
              i++;
              ended = true;
              curNodeBuf += ` : (${this.visitBlock(next.block)})`;
              break;
            } else {
              break;
            }
          }

          if (!ended) curNodeBuf += ` : undefined`;
          buf += `__jade_nodes = __jade_nodes.concat(${curNodeBuf});`;
        } else if (/^\s*while/.test(node.val)) {
          // handle while loops
          curNodeBuf += `(function(){
            var buf = [];
            ${node.val} {
              buf = buf.concat(${this.visitBlock(node.block)})
            }
            return buf
          }).call(this)`;
          buf += `__jade_nodes = __jade_nodes.concat(${curNodeBuf});`;
        } else if (node.val) {
          // arbitrary code
          buf += node.buffer ? `__jade_nodes = __jade_nodes.concat(${node.val});` : `${node.val};`;
        }

        break;
      case `Comment`:
      case `BlockComment`:
        buf += this.visitComment(node);
        break;
      case `Each`:
        curNodeBuf = this.visitEach(node);
        buf += `__jade_nodes = __jade_nodes.concat(${curNodeBuf});`;
        break;
      default: {
        curNodeBuf = this.visit(node);
        if (curNodeBuf) {
          buf += `__jade_nodes = __jade_nodes.concat(${curNodeBuf});`;
        }
      }
    }
  }

  return buf ? `(function() {var __jade_nodes = [];${buf};return __jade_nodes}).call(this)` : ``;
};

/**
 * Handles jade's special case statements,
 * which breaks it down into a bunch of `if` statements.
 *
 * TODO: maybe memoize the main expression
 */

Compiler.prototype.visitCase = function(code) {
  let str = ``;
  let defaulted = false;
  let conditions = [];

  for (const node of code.block.nodes) {
    if (node.expr === `default`) {
      defaulted = true;
      str += `(${this.visitBlock(node.block)})`;
      break;
    }

    conditions.push(`((${code.expr}) == (${node.expr}))`);
    if (node.block) {
      str += `(${conditions.join(` || `)})
        ? (${this.visitBlock(node.block)})
        : `;
      conditions = [];
    }
  }

  if (!defaulted) str += `undefined`;
  return str;
};

/**
 * Handle each statements
 * uses Array.concat() with result of each iteration to ensure flattening
 */

Compiler.prototype.visitEach = function(code) {
  return `(function(__list) {
    var __each_nodes = [];
    for (var ${code.key} = 0; ${code.key} < __list.length; ${code.key}++) {
      var ${code.val} = __list[${code.key}];
      __each_nodes = __each_nodes.concat(${this.visitBlock(code.block)});
    }
    return __each_nodes;
  })(${code.obj})`;
};

/**
 * Handle mixin declarations and calls
 */

Compiler.prototype.visitMixin = function(mixin) {
  let str = ``;
  let args = mixin.args || ``;
  let rest = ``;
  let initRest = ``;

  if (mixin.call) {

    // mixin call

    let ctx;
    const ctxItems = [];
    if (mixin.block) {
      ctxItems.push(`block: function() { return ${this.visitBlock(mixin.block)}; }`);
    }
    if (mixin.attrs.length) {
      ctxItems.push(`attributes: ` + this.visitAttributes(mixin.attrs));
    }
    if (ctxItems.length) {
      ctx = `{${ctxItems.join(`,`)}}`;
    } else {
      ctx = `this`;
    }
    if (args) {
      args = `, ${args}`;
    }
    str = `jade_mixins['${mixin.name}'].call(${ctx}${args})`;

  } else {

    // mixin declaration

    args = args ? args.split(`,`) : [];
    if (args.length && /^\.\.\./.test(args[args.length - 1].trim())) {
      rest = args.pop().trim().replace(/^\.\.\./, ``);
    }
    if (rest) {
      initRest = `
        var ${rest} = [];
        for (var jade_interp = ${args.length}; jade_interp < arguments.length; jade_interp++) {
          ${rest}.push(arguments[jade_interp]);
        }
      `;
    }
    this.mixins.push(`
      jade_mixins['${mixin.name}'] = function(${args.join(`,`)}) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        ${initRest}
        return ${this.visitBlock(mixin.block)};
      };
    `);

  }

  return str;
};

/**
 * Handle mixin's `block` keyword
 */

Compiler.prototype.visitMixinBlock = function() {
  return `block && block()`;
};


module.exports = Compiler;
