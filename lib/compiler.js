'use strict';

const VDOM_CONFIG = require(`./config`).VDOM_CONFIG;

const OVERRIDABLE_CONFIG_OPTIONS = [
  `marshalDataset`,
  `propsWrapper`,
  `rawProps`,
];

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

function Compiler(node, options) {
  this.node = node;
  this.options = options;

  // set options from vdom config + overrides
  this.vdom = VDOM_CONFIG[options.vdom || `virtual-dom`];
  for (let optionName of OVERRIDABLE_CONFIG_OPTIONS) {
    const optionSource = this.options.hasOwnProperty(optionName) ? this.options : this.vdom;
    this[optionName] = optionSource[optionName];
  }
}

/**
 * Actually compile the tokens.
 * We want to match the Jade API as much as possible here.
 */

Compiler.prototype.compile = function() {
  let tagged = null;
  let js = ``;

  this.hasObjAttrs = false;
  this.mixins = [];

  for (const node of this.node.nodes) {
    switch (node.type) {
      case `Block`:
        this.visitBlock(node);
        break;
      case `Code`:
        assertWithDetailedError(node, !tagged, `Code must exist before the tag.`);
        js += node.val + `;\n`;
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

  // probably this stuff should all be extracted/extractable to a single
  // virtual-jade runtime to reduce bundle weight when lots of templates
  // are combined in one bundle
  if (this.hasCode) {
    js = `
      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      ${js}
    `;
  }
  if (this.hasObjAttrs) {
    js = `
      var __vjadeObjToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      ${js}
    `;
  }

  if (this.mixins.length > 0) {
    js = `var jade_mixins = {}, $mixins = jade_mixins;${this.mixins.join(``)}${js}`;
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

Compiler.prototype.visitText = function(node, prefix=``) {
  return JSON.stringify(prefix + node.val)
    .replace(/#\{(.+?)\}/g, `" + ($1) + "`);
};

/**
 * Wrap props dictionary if necessary
 * e.g. {foo: 'bar'} => {props: {foo: 'bar'}}
 */
Compiler.prototype.wrapProps = function(propsOut, propsWrapper) {
  if (propsOut.length) {
    if (arguments.length < 2 && !this.rawProps) {
      propsWrapper = this.propsWrapper;
    }
    if (propsWrapper) {
      propsOut = `{${propsWrapper}:${propsOut}}`;
    }
  }

  return propsOut;
};

/**
 * Handle a "Literal" include such as an SVG or HTML file
 */
Compiler.prototype.visitLiteral = function(node) {
  const escapedSource = node.str.replace(/'/g, `\\'`).replace(/\n/g, ``);
  const propsOut = this.wrapProps(`{innerHTML: '${escapedSource}'}`, this.propsWrapper);
  return `h('div', ${propsOut})`;
};

/**
 * Build a single HTML element.
 */

Compiler.prototype.visitTag = function(tag) {
  let buf = `h(` + (tag.buffer ? `(${tag.name})` : JSON.stringify(tag.name));
  let propsOut = this.wrapProps(this.visitAttributes(tag.attrs, tag.attributeBlocks));
  if (propsOut.length) {
    buf += `,${propsOut}`;
  }
  // TODO: handle cases when there is both code and blocks
  if (tag.code) {
    this.hasCode = true;
    buf += `, [__vjadeSafeCode(${tag.code.val})]`;
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

  if (this.rawProps) {

    // easy-peasy, pass through everything directly except class/id

    const jadeClasses = [];
    let rawClassObj = ``;
    let hasClasses = false;
    let id = ``;
    for (const attr of attrs) {
      if (attr.name === `class`) {
        hasClasses = true;
        if (attr.val[0] === `'`) {
          jadeClasses.push(attr.val);
        } else {
          rawClassObj = attr.val;
        }
      } else if (attr.name === `id` && attr.val[0] === `'`) {
        id = attr.val;
      } else {
        props[attr.name] = attr.val;
      }
    }

    // generate class code
    if (hasClasses) {
      const jadeClassObj = `{${jadeClasses.map(cls => `${cls}:true`).join(`,`)}}`;
      if (rawClassObj) {
        if (jadeClasses.length) {
          props.class = `Object.assign({}, ${rawClassObj}, ${jadeClassObj})`;
        } else {
          props.class = rawClassObj;
        }
      } else {
        props.class = jadeClassObj;
      }
    }

    // generate id code
    if (id) {
      const idObj = `{id: ${id}}`;
      const propsObj = props[this.propsWrapper];
      props[this.propsWrapper] = propsObj ? `Object.assign(${idObj}, ${propsObj})` : idObj;
    }

  } else {

    // translate jade attrs to the appropriate vdom props

    const classExprs = [];
    const dataset = {};
    for (const attr of attrs) {
      let name = ATTRS_TO_PROPS[attr.name] || attr.name;
      let val = attr.val;

      if (name === `className`) {
        /**
         * We need to handle `class` separately because
         * it can be defined multiple times.
         */
        const isObj = !!val.match(/^\s*\{(.|[\r\n])+\}\s*$/);
        if (isObj) {
          this.hasObjAttrs = true;
          val = `__vjadeObjToAttrs(${val})`;
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
          node.val = node.val.trim();
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
      case `Text`:
        // contiguous text nodes need to be rendered with whitespace in between
        const prefix = i > 0 && nodes[i - 1].type === `Text` ? ` ` : ``;
        curNodeBuf += this.visitText(node, prefix);
        if (curNodeBuf) {
          buf += `__jade_nodes = __jade_nodes.concat(${curNodeBuf});`;
        }
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
 * - uses Array.concat() with result of each iteration to ensure flattening
 * - closes over k/v vars in each iteration block so they can be used later
 *   (e.g. in event handler callbacks)
 */

Compiler.prototype.visitEach = function(code) {
  let out = `(function() {
    var $$obj = (${code.obj});
    var $$eachNodes;
    var $$iterated = false;
    if (Array.isArray($$obj)) {
      $$eachNodes = $$obj.reduce(function($$eachNodes, ${code.val}, ${code.key}) {
        $$iterated = true;
        return $$eachNodes.concat(${this.visitBlock(code.block)});
      }, []);
    } else {
      $$eachNodes = [];
      for (var $$objKey in $$obj) {
        (function() {
          var ${code.key} = $$objKey;
          if ($$obj.hasOwnProperty(${code.key})) {
            $$iterated = true;
            var ${code.val} = $$obj[${code.key}];
            $$eachNodes = $$eachNodes.concat(${this.visitBlock(code.block)});
          }
        })();
      }
    }
  `;

  if (code.alternative) {
    out += `
    if (!$$iterated) {
      return ${this.visitBlock(code.alternative)};
    }
    `;
  }

  out += `
    return $$eachNodes;
  })()`;

  return out;
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
