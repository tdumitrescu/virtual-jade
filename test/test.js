/* eslint-env mocha */

'use strict';

const assert = require(`assert`);
const debug = require(`debug`)(`test`);
const expect = require(`expect.js`);
const fs = require(`fs`);
const jsdom = require(`mocha-jsdom`);
const parse5 = require(`parse5-utils`);
const path = require(`path`);
const vdomToHTML = require(`vdom-to-html`);
const snabbdomToHTML = require(`snabbdom-to-html`);

const render = require(`..`);


function fixtureFilename(name) {
  return path.resolve(__dirname, `fixtures/` + name + `.jade`);
}

function fixture(name) {
  return fs.readFileSync(fixtureFilename(name), `utf8`);
}

function fixtureToHTML(fixtureName, locals, options) {
  options = Object.assign({filename: fixtureFilename(fixtureName)}, options);

  const snabb = options.vdom === `snabbdom`;
  if (snabb) {
    // putting all 'raw' attrs into the props object allows
    // the same template fixtures to work with both virtual-dom
    // and snabbdom, otherwise snabb expects special keys
    // props: {}, attrs: {}
    options.propsWrapper = `props`;
  }

  const compiled = render(fixture(fixtureName), options);
  debug(compiled);

  const fn = eval(`(${compiled})`);
  const root = fn.call({class: `asdf`}, locals);
  const toHTML = snabb ? snabbdomToHTML : vdomToHTML;
  const html = toHTML(root);
  debug(html);

  parse5.parse(html, true);
  return html;
}

describe(`configuration`, function() {
  it(`should throw when an invalid vdom config is supplied`, function() {
    expect(render).withArgs(fixture(`simple`), {
      filename: fixtureFilename(`simple`),
      vdom: `foobar`,
    }).to.throwException(`No virtual-jade config found for vdom type: foobar`);
  });

  it(`should throw a parser error with filename and line number when rendering a broken template`, function() {
    const file = `break-parser`;
    const filename = fixtureFilename(file);

    expect(render).withArgs(fixture(file), {filename}).to.throwException(function(err) {
      const filenameAndLineNo = new RegExp(filename.replace(`/`, `\/`) + `:2`);
      expect(err.path).to.be(filename);
      expect(err.message).to.match(filenameAndLineNo);
      expect(err.message).to.match(/Unexpected identifier/);
    });
  });

  it(`should throw a compiler error with filename and line number when rendering a broken template`, function() {
    const file = `break-compiler`;
    const filename = fixtureFilename(file);
    expect(render).withArgs(fixture(file), {filename}).to.throwException(function(err) {
      const filenameAndLineNo = new RegExp(filename.replace(`/`, `\/`) + `:2`);
      expect(err.path).to.be(filename);
      expect(err.message).to.match(filenameAndLineNo);
      expect(err.message).to.match(/You can only have one top-level tag!/);
    });
  });

  it(`should render a template without options`, function() {
    const compiled = render(fixture(`attributes`));
    expect(compiled).to.contain(`class1`);
    expect(compiled).to.contain(`foo`);
    expect(compiled).to.contain(`doge`);
  });
});


// run rendering tests against each supported Virtual DOM library

const VDOM_LIBS = [
  `virtual-dom`,
  `snabbdom`,
];

for (let vdom of VDOM_LIBS) {
  const renderFixture = function(fixtureName, locals) {
    return fixtureToHTML(fixtureName, locals, {vdom, pretty: true});
  };

  describe(`rendering with ${vdom}`, function() {
    it(`should render a template`, function() {
      const html = renderFixture(`item`, {
        item: {
          id: `1234`,
          title: `some title`,
          description: `some description`,
          active: true,
        },
      });

      expect(html).to.contain(`item active`);
      expect(html).to.contain(`class="title"`);
      expect(html).to.contain(`<h3`);
      expect(html).to.contain(`</h3>`);
      expect(html).to.contain(`some title`);
      expect(html).to.contain(`some description`);
    });

    it(`should beautify when option is set`, function() {
      const fn = render(fixture(`item`), {pretty: true});
      const lines = fn.split(`\n`);
      assert(lines.length > 15);
      assert(lines[lines.length - 1].trim() === `}`);
    });

    it(`should insert dynamic tag names`, function() {
      let html = renderFixture(`dynamic-tag`, {myTag: `input`});
      expect(html).to.contain(`<input class="llamas">`);
      html = renderFixture(`dynamic-tag`, {myTag: `textarea`});
      expect(html).to.contain(`<textarea class="llamas">`);
    });

    it(`renders a simple template`, function() {
      const html = renderFixture(`simple`);
      assert(html === `<div>This is text</div>`);
    });

    it(`translates basic class notation`, function() {
      const html = renderFixture(`class`);
      expect(html).to.contain(`div class="foo"`);
      expect(html).to.contain(`div class="baz llamas"`);
    });

    describe(`iteration`, function() {
      it(`should run "each" loops correctly`, function() {
        const html = renderFixture(`each-expression`, {values: [`foo`, `bar`]});
        expect(html).to.contain(`<li>foo</li><li>bar</li>`);
      });

      it(`should run "while" loops correctly`, function() {
        const html = renderFixture(`while`);
        expect(html.match(/<div class=\"item\">/g)).to.have.length(5);
      });
    });

    describe(`multiple files`, function() {
      it(`should insert included files`, function() {
        const html = renderFixture(`include`);
        expect(html).to.contain(`<p>Hello</p>`);
        expect(html).to.contain(`<div class="included-content">llamas!!!</div>`);
        expect(html).to.contain(`<p>world</p>`);
      });

      it(`should make included mixins available`, function() {
        const html = renderFixture(`include-with-mixin`);
        expect(html).to.contain(`<div class="foo">`);
        expect(html).to.contain(`<div class="hello">insert me</div>`);
      });

      it(`should insert extended files`, function() {
        const html = renderFixture(`extends`);
        expect(html).to.contain(`<div class="foo">`);
        expect(html).to.contain(`capybara`);
        expect(html).to.contain(`default content`);
      });
    });

    describe(`attributes`, function() {
      it(`should add arbitrary attributes`, function() {
        const html = renderFixture(`attributes`);
        expect(html).to.contain(`required`);
        expect(!html.includes(`something`) || html.includes(`something="false"`)).to.be.ok();
      });

      it(`should add class attributes in array notation`, function() {
        let html = renderFixture(`attributes`);
        expect(html).to.contain(`1 2`);
        html = renderFixture(`attributes`, {variable: `meow`});
        expect(html).to.contain(`1 2 meow`);
      });

      it(`should add class attributes in object notation`, function() {
        let html = renderFixture(`attributes`);
        expect(html).to.contain(`obj1`);
        expect(html).not.to.contain(`obj2`);

        html = renderFixture(`attributes`, {variable: `doge`});
        expect(html).to.contain(`obj1`);
        expect(html).to.contain(`obj2`);
      });

      it(`should combine class attributes in different notations gracefully`, function() {
        let html = renderFixture(`attributes`);
        expect(html).to.contain(`mixed`);
        expect(html).to.contain(`mixedArray1`);
        expect(html).not.to.contain(`mixedObj1`);

        html = renderFixture(`attributes`, {var2: `doge`});
        expect(html).to.contain(`mixed`);
        expect(html).to.contain(`mixedArray1`);
        expect(html).to.contain(`mixedObj1`);
        expect(html).to.contain(`doge`);
      });

      it(`should render data attributes`, function() {
        const html = renderFixture(`attributes`, {variable: `capybara`});
        expect(html).to.contain(`data-foo-id="42"`);
        expect(html).to.contain(`data-var="capybara"`);
      });

      it(`should convert attributes to correct property names`, function() {
        const html = renderFixture(`attributes`);
        expect(html).to.contain(`autocomplete="on"`);
        expect(html).to.contain(`tabindex="5"`);
        expect(html).to.contain(`for="special-attr"`);
      });
    });

    describe(`case statements`, function() {
      it(`should not execute any cases when none match`, function() {
        const html = renderFixture(`case`);
        expect(html).not.to.contain(`foo`);
        expect(html).not.to.contain(`bar`);
      });

      it(`should execute default when no others match`, function() {
        const html = renderFixture(`case`);
        expect(html).to.contain(`llama`);
      });

      it(`should execute only one match`, function() {
        const html = renderFixture(`case`, {variable: 1});
        expect(html).to.contain(`span`);
        expect(html).not.to.contain(`input`);
        expect(html).not.to.contain(`textarea`);
      });

      it(`should fall through from the first case in a chain`, function() {
        const html = renderFixture(`case`, {variable2: `d`});
        expect(html).to.contain(`bar`);
        expect(html).not.to.contain(`foo`);
      });

      it(`should fall through from the middle case in a chain`, function() {
        const html = renderFixture(`case`, {variable2: `e`});
        expect(html).to.contain(`bar`);
        expect(html).not.to.contain(`foo`);
      });

      it(`should fall through from the last case in a chain`, function() {
        const html = renderFixture(`case`, {variable2: `f`});
        expect(html).to.contain(`bar`);
        expect(html).not.to.contain(`foo`);
      });
    });

    describe(`code blocks`, function() {
      let html;

      beforeEach(function() {
        html = renderFixture(`code`);
      });

      it(`should run unbuffered code correctly`, function() {
        expect(html).to.contain(`<div class="example bar">`);
      });

      it(`should use locals when evaluating`, function() {
        html = renderFixture(`code`, {x: 0});
        expect(html).to.contain(`<div class="baz">`);

        html = renderFixture(`code`, {x: -1});
        expect(html).not.to.contain(`<div class="baz">`);
      });

      it(`should output inline buffered code`, function() {
        expect(html).to.contain(`<div class="inline-script"><div class="raw-inline">within another div`);
      });

      it(`should output standalone buffered code`, function() {
        expect(html).to.contain(`<div class="raw-buffered">raw so raw`);
      });

      it(`should not output unbuffered code`, function() {
        expect(html).not.to.contain(`should not be output`);
      });
    });
  });
}

describe(`Render`, function() {
  jsdom();

  describe(`multiple files`, function() {
    it(`should insert included literal (non-jade) files`, function() {
      const html = fixtureToHTML(`literal-import`);
      const singleRootImport = `<div class="test">test</div>`;
      const multiRootImport = `<div>child 1</div><div>child 2</div>`;
      const htmlEntities = function(str) {
        return String(str).replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`).replace(/"/g, `&quot;`);
      };
      const expectedContents =
        `<div class="raw">` +
          `<div class="single-root">` +
            `<text>` + htmlEntities(singleRootImport) + `</text>` +
          `</div>` +
          `<div class="multi-root">` +
            `<text>` + htmlEntities(`<div>` + multiRootImport + `</div>`) + `</text>` +
          `</div>` +
        `</div>`;
      assert(html === expectedContents);
    });
  });
});
