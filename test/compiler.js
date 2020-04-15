/* eslint-env mocha */

'use strict';

const expect = require(`expect.js`);
const fs = require(`fs`);
const parse5 = require(`parse5-utils`);
const Parser = require(`jade`).Parser;
const path = require(`path`);
const toHTML = require(`vdom-to-html`);

const Compiler = require(`../lib/compiler`);
const VDOM_RUNTIME = require(`../lib/config`).VDOM_CONFIG[`virtual-dom`].runtime;

function fixture(name) {
  return fs.readFileSync(path.resolve(__dirname, `fixtures/` + name + `.jade`), `utf8`);
}

function testCompilation(fixtureName, options) {
  if (!options) options = {};
  options.pretty = true;
  const parser = new Parser(fixture(fixtureName));
  const tokens = parser.parse();
  const compiler = new Compiler(tokens, options);
  const js = compiler.compile();
  // make sure it's syntactically valid
  new Function(js);
  return js;
}


describe(`Compiler`, function() {
  it(`compiles functions as properties`, function() {
    testCompilation(`inline-function`);
  });

  it(`throws if there is not exactly 1 tag`, function() {
    expect(testCompilation).withArgs(`root-if`).to.throwException();
    expect(testCompilation).withArgs(`empty`).to.throwException();
    expect(testCompilation).withArgs(`multiple-tags`).to.throwException();
  });

  it(`compiles the boilerplate`, function() {
    const js = testCompilation(`boilerplate`);
    const root = eval(`${VDOM_RUNTIME}(function(){${js}})()`);
    const html = toHTML(root);
    parse5.parse(html, true);
  });

  it(`optionally wraps attributes in a stringify call`, function() {
    const js = testCompilation(`attributes`, {rawProps: true, serializeAttrsObjects: true});
    expect(js).to.contain(`__vjadeStringifyAttrsIfObj({obj: {foo: 'bar'}})`);
  });

  it(`compiles attributes`, function() {
    const js = testCompilation(`attributes`);
    expect(js).not.to.match(/\bclass\b/);
    expect(js.match(/"className"/g)).to.have.length(4);
  });

  it(`compiles data attributes to dataset`, function() {
    const js = testCompilation(`attributes`);
    expect(js).not.to.match(/\bdata-foo\b/);
    expect(js).to.match(/\bdataset\b/);
  });

  it(`optionally does not compile data attributes to dataset`, function() {
    const js = testCompilation(`attributes`, {marshalDataset: false});
    expect(js).not.to.match(/\bdataset\b/);
    expect(js).to.match(/\bdata-foo\b/);
  });

  it(`handles basic string interpolation`, function() {
    const js = testCompilation(`interpolation`);
    expect(js).to.contain(`+ (x + 5) +`);
    expect(js).to.contain(`+ (x - 2) +`);
  });

  it(`compiles if statements`, function() {
    const js = testCompilation(`if`);
    expect(js).not.to.contain(`undefined(`);
    const root = eval(`${VDOM_RUNTIME}(function(){${js}})()`);
    const html = toHTML(root);
    parse5.parse(html, true);
    expect(html).to.contain(`<span></span><span></span>`);
    expect(html).not.to.contain(`<em>`);
    expect(html).to.contain(`a1`);
    expect(html).not.to.contain(`a2`);
    expect(html).not.to.contain(`a3`);
  });

  it(`compiles case statements`, function() {
    testCompilation(`case`);
  });

  it(`compiles top-level JS`, function() {
    const js = testCompilation(`top-level-code`);
    expect(js).to.contain(`var a = 1;\n`);
    expect(js).to.contain(`var b = 2;\n`);
  });

  it(`compiles JS in blocks`, function() {
    const js = testCompilation(`code`);
    expect(js).to.contain(`foo = ['bar'];`);
    expect(js).to.contain(`var z = [\n  1,\n  2,\n  3\n];`);
  });

  it(`compiles each`, function() {
    testCompilation(`each`);
  });

  it(`compiles each, index`, function() {
    const js = testCompilation(`each-index`);
    expect(js).to.contain(`anIndex`);
  });

  it(`compiles each w/ expressions`, function() {
    testCompilation(`each-expression`);
  });

  it(`compiles a while loop`, function() {
    testCompilation(`while`);
  });

  it(`compiles mixins without arguments`, function() {
    const js = testCompilation(`mixin`);
    expect(js).to.contain(`jade_mixins['item'].call(this)`);
  });

  it(`compiles mixins with arguments`, function() {
    const js = testCompilation(`mixin-args`);
    expect(js).to.contain(`jade_mixins['item'].call(this, 5)`);
  });

  it(`compiles mixins with rest arguments`, function() {
    const js = testCompilation(`mixin-rest`);
    expect(js).to.contain(`function(x)`);
    expect(js).to.contain(`jade_mixins['item'].call(this, 5, 'a', 'b')`);
  });

  it(`compiles mixins with blocks`, function() {
    const js = testCompilation(`mixin-block`);
    expect(js).to.contain(`jade_mixins['item'].call({block: function()`);
  });

  it(`compiles mixins with attributes`, function() {
    const js = testCompilation(`mixin-attrs`);
    expect(js).to.contain(`jade_mixins['item'].call({attributes: {`);
  });

  it(`compiles mixins and exposes $mixins`, function() {
    const js = testCompilation(`mixin`);
    expect(js).to.contain(`$mixins = jade_mixins`);
  });
});
