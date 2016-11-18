/* eslint-env mocha */

'use strict';

const toHTML = require(`vdom-to-html`);
const parse5 = require(`parse5-utils`);
const Parser = require(`jade`).Parser;
const assert = require(`assert`);
const path = require(`path`);
const fs = require(`fs`);

const Compiler = require(`../lib/compiler`);
const VDOM_RUNTIME = require(`../lib/config`).VDOM_CONFIG[`virtual-dom`].runtime;

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, `fixtures/` + name + `.jade`), `utf8`);
}

function testCompilation(fixtureName, options) {
  if (!options) options = {};
  options.pretty = true;
  let parser = new Parser(fixture(fixtureName));
  let tokens = parser.parse();
  let compiler = new Compiler(tokens, options);
  let js = compiler.compile();
  // make sure it's syntactically valid
  new Function(js);
  return js;
}


describe(`Compiler`, function () {
  it(`should compile functions as properties`, function () {
    testCompilation(`inline-function`);
  });

  it(`should throw if there is not exactly 1 tag`, function () {
    assert.throws(function () {
      testCompilation(`root-if`);
    });

    assert.throws(function () {
      testCompilation(`empty`);
    });

    assert.throws(function () {
      testCompilation(`multiple-tags`);
    });
  });

  it(`should compile the boilerplate`, function () {
    let js = testCompilation(`boilerplate`);
    let root = eval(`${VDOM_RUNTIME}(function(){${js}})()`);
    let html = toHTML(root);
    parse5.parse(html, true);
  });

  it(`should compile attributes`, function () {
    let js = testCompilation(`attributes`);
    assert(!js.match(/\bclass\b/), `\`class\` found somewhere!`);
    assert.equal(js.match(/"className"/g).length, 4, `Incorrect number of class properties set.`);
  });

  it(`should compile data attributes to dataset`, function () {
    let js = testCompilation(`attributes`);
    assert(!js.match(/\bdata-foo\b/), `\`data-foo\` found somewhere!`);
    assert(js.match(/\bdataset\b/), `\`dataset\` not found!`);
  });

  it(`should optionally not compile data attributes to dataset`, function () {
    let js = testCompilation(`attributes`, {marshalDataset: false});
    assert(!js.match(/\bdataset\b/), `\`dataset\` found somewhere!`);
    assert(js.match(/\bdata-foo\b/), `\`data-foo\` not found!`);
  });

  it(`should handle basic string interpolation`, function () {
    let js = testCompilation(`interpolation`);
    assert(~js.indexOf(`+ (x + 5) +`));
    assert(~js.indexOf(`+ (x - 2) +`));
  });

  it(`should compile if statements`, function () {
    let js = testCompilation(`if`);
    assert(!~js.indexOf(`undefined(`));
    let root = eval(`${VDOM_RUNTIME}(function(){${js}})()`);
    let html = toHTML(root);
    parse5.parse(html, true);
    assert(~html.indexOf(`<span></span><span></span>`));
    assert(!~html.indexOf(`<em>`));
    assert(~html.indexOf(`a1`));
    assert(!~html.indexOf(`a2`));
    assert(!~html.indexOf(`a3`));
  });

  it(`should compile case statements`, function () {
    testCompilation(`case`);
  });

  it(`should compile top-level JS`, function () {
    let js = testCompilation(`top-level-code`);
    assert(~js.indexOf(`var a = 1\n`));
    assert(~js.indexOf(`var b = 2\n`));
  });

  it(`should compile JS in blocks`, function () {
    let js = testCompilation(`code`);
    assert(~js.indexOf(`foo = ['bar']`));
  });

  it(`should compile each`, function () {
    testCompilation(`each`);
  });

  it(`should compile each, index`, function () {
    let js = testCompilation(`each-index`);
    assert(~js.indexOf(`anIndex`));
  });

  it(`should compile each w/ expressions`, function () {
    testCompilation(`each-expression`);
  });

  it(`should compile a while loop`, function () {
    testCompilation(`while`);
  });

  it(`should compile mixins without arguments`, function () {
    let js = testCompilation(`mixin`);
    assert(~js.indexOf(`jade_mixins['item'].call(this)`));
  });

  it(`should compile mixins with arguments`, function () {
    let js = testCompilation(`mixin-args`);
    assert(~js.indexOf(`jade_mixins['item'].call(this, 5)`));
  });

  it(`should compile mixins with rest arguments`, function () {
    let js = testCompilation(`mixin-rest`);
    assert(~js.indexOf(`function(x)`));
    assert(~js.indexOf(`jade_mixins['item'].call(this, 5, 'a', 'b')`));
  });

  it(`should compile mixins with blocks`, function () {
    let js = testCompilation(`mixin-block`);
    assert(~js.indexOf(`jade_mixins['item'].call({block: function()`));
  });

  it(`should compile mixins with attributes`, function () {
    let js = testCompilation(`mixin-attrs`);
    assert(~js.indexOf(`jade_mixins['item'].call({attributes: {`));
  });
});
