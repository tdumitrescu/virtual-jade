/* eslint-env mocha */

'use strict';

const debug = require(`debug`)(`test`);
const expect = require(`expect.js`);
const fs = require(`fs`);
const parse5 = require(`parse5-utils`);
const path = require(`path`);
const vdomToHTML = require(`vdom-to-html`);
const snabbdomToHTML = require(`snabbdom-to-html`);

const render = require(`..`);

// expected output from literal imports
const SINGLE_ROOT_IMPORT_HTML = `<div class="test">test</div>`;
const MULTI_ROOT_IMPORT_HTML = `<div>child 1</div><div>child 2</div>`;

function fixtureFilename(name) {
  return path.resolve(__dirname, `fixtures/` + name + `.jade`);
}

function fixture(name) {
  return fs.readFileSync(fixtureFilename(name), `utf8`);
}

function fixtureToHTML(fixtureName, locals, options) {
  options = Object.assign({filename: fixtureFilename(fixtureName)}, options);

  const snabb = options.vdom === `snabbdom`;
  if (snabb && !options.snabbArgs) {
    // putting all 'raw' attrs into the props object allows
    // the same template fixtures to work with both virtual-dom
    // and snabbdom, otherwise snabb expects special keys
    // props: {}, attrs: {}
    options.propsWrapper = `props`;
    options.rawProps = false;
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
  it(`throws when an invalid vdom config is supplied`, function() {
    expect(render).withArgs(fixture(`simple`), {
      filename: fixtureFilename(`simple`),
      vdom: `foobar`,
    }).to.throwException(`No virtual-jade config found for vdom type: foobar`);
  });

  it(`throws a parser error with filename and line number when rendering a broken template`, function() {
    const file = `break-parser`;
    const filename = fixtureFilename(file);

    expect(render).withArgs(fixture(file), {filename}).to.throwException(function(err) {
      const filenameAndLineNo = new RegExp(filename.replace(`/`, `\/`) + `:2`);
      expect(err.path).to.be(filename);
      expect(err.message).to.match(filenameAndLineNo);
      expect(err.message).to.match(/Unexpected identifier/);
    });
  });

  it(`throws a compiler error with filename and line number when rendering a broken template`, function() {
    const file = `break-compiler`;
    const filename = fixtureFilename(file);
    expect(render).withArgs(fixture(file), {filename}).to.throwException(function(err) {
      const filenameAndLineNo = new RegExp(filename.replace(`/`, `\/`) + `:2`);
      expect(err.path).to.be(filename);
      expect(err.message).to.match(filenameAndLineNo);
      expect(err.message).to.match(/You can only have one top-level tag!/);
    });
  });

  it(`renders a template without options`, function() {
    const compiled = render(fixture(`attributes`));
    expect(compiled).to.contain(`class1`);
    expect(compiled).to.contain(`foo`);
    expect(compiled).to.contain(`doge`);
  });
});

describe(`rendering`, function() {

  // run rendering tests against each supported Virtual DOM library

  const VDOM_LIBS = [
    `virtual-dom`,
    `snabbdom`,
  ];

  for (let vdom of VDOM_LIBS) {
    const renderFixture = function(fixtureName, locals) {
      return fixtureToHTML(fixtureName, locals, {vdom, pretty: true});
    };

    context(`using library "${vdom}"`, function() {
      it(`renders a template`, function() {
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

      it(`beautifies when option is set`, function() {
        const fn = render(fixture(`item`), {pretty: true});
        const lines = fn.split(`\n`);
        expect(lines.length).to.be.greaterThan(15);
        expect(lines[lines.length - 1].trim()).to.be(`}`);
      });

      it(`inserts dynamic tag names`, function() {
        let html = renderFixture(`dynamic-tag`, {myTag: `input`});
        expect(html).to.contain(`<input class="llamas">`);
        html = renderFixture(`dynamic-tag`, {myTag: `textarea`});
        expect(html).to.contain(`<textarea class="llamas">`);
      });

      it(`renders a simple template`, function() {
        const html = renderFixture(`simple`);
        expect(html).to.be(`<div>This is text</div>`);
      });

      it(`translates basic class notation`, function() {
        const html = renderFixture(`class`);
        expect(html).to.contain(`div class="foo"`);
        expect(html).to.contain(`div class="baz llamas"`);
      });

      it(`renders falsey numeric values`, function() {
        const html = renderFixture(`falsey-content`);
        expect(html).to.contain(`<span class="zero-a">0</span>`);
        expect(html).to.contain(`<span class="zero-b">0</span>`);
        expect(html).to.contain(`<span class="zero-c">0</span>`);
        expect(html).to.contain(`<span class="zero-d">0</span>`);
        expect(html).to.contain(`<span class="one">1</span>`);
        expect(html).to.contain(`<span class="null">null</span>`);
      });

      describe(`iteration`, function() {
        it(`runs "each" loops correctly`, function() {
          const html = renderFixture(`each-expression`, {values: [`foo`, `bar`]});
          expect(html).to.contain(`<li>foo</li><li>bar</li>`);
        });

        it(`runs "while" loops correctly`, function() {
          const html = renderFixture(`while`);
          expect(html.match(/<div class=\"item\">/g)).to.have.length(5);
        });

        it(`iterates over object key/value pairs correctly`, function() {
          const html = renderFixture(`each-object`, {obj: {wombat: `llama`}});
          expect(html).to.contain(`<div class="obj-entry">Value of wombat is llama</div>`);
          expect(html.match(/obj-entry/g)).to.have.length(1);
        });
      });

      describe(`multiple files`, function() {
        it(`inserts included files`, function() {
          const html = renderFixture(`include`);
          expect(html).to.contain(`<p>Hello</p>`);
          expect(html).to.contain(`<div class="included-content">llamas!!!</div>`);
          expect(html).to.contain(`<p>world</p>`);
        });

        it(`makes included mixins available`, function() {
          const html = renderFixture(`include-with-mixin`);
          expect(html).to.contain(`<div class="foo">`);
          expect(html).to.contain(`<div class="hello">insert me</div>`);
        });

        it(`inserts extended files`, function() {
          const html = renderFixture(`extends`);
          expect(html).to.contain(`<div class="foo">`);
          expect(html).to.contain(`capybara`);
          expect(html).to.contain(`default content`);
        });
      });

      describe(`attributes`, function() {
        it(`adds arbitrary attributes`, function() {
          const html = renderFixture(`attributes`);
          expect(html).to.contain(`required`);
          expect(!html.includes(`something`) || html.includes(`something="false"`)).to.be.ok();
        });

        it(`adds class attributes in array notation`, function() {
          let html = renderFixture(`attributes`);
          expect(html).to.contain(`1 2`);
          html = renderFixture(`attributes`, {variable: `meow`});
          expect(html).to.contain(`1 2 meow`);
        });

        it(`adds class attributes in object notation`, function() {
          let html = renderFixture(`attributes`);
          expect(html).to.contain(`obj1`);
          expect(html).not.to.contain(`obj2`);

          html = renderFixture(`attributes`, {variable: `doge`});
          expect(html).to.contain(`obj1`);
          expect(html).to.contain(`obj2`);
        });

        it(`combines class attributes in different notations gracefully`, function() {
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

        it(`renders data attributes`, function() {
          const html = renderFixture(`attributes`, {variable: `capybara`});
          expect(html).to.contain(`data-foo-id="42"`);
          expect(html).to.contain(`data-var="capybara"`);
        });

        it(`converts attributes to correct property names`, function() {
          const html = renderFixture(`attributes`);
          expect(html).to.contain(`autocomplete="on"`);
          expect(html).to.contain(`tabindex="5"`);
          expect(html).to.contain(`for="special-attr"`);
        });
      });

      describe(`case statements`, function() {
        it(`does not execute any cases when none match`, function() {
          const html = renderFixture(`case`);
          expect(html).not.to.contain(`foo`);
          expect(html).not.to.contain(`bar`);
        });

        it(`executes default when no others match`, function() {
          const html = renderFixture(`case`);
          expect(html).to.contain(`llama`);
        });

        it(`executes only one match`, function() {
          const html = renderFixture(`case`, {variable: 1});
          expect(html).to.contain(`span`);
          expect(html).not.to.contain(`input`);
          expect(html).not.to.contain(`textarea`);
        });

        it(`falls through from the first case in a chain`, function() {
          const html = renderFixture(`case`, {variable2: `d`});
          expect(html).to.contain(`bar`);
          expect(html).not.to.contain(`foo`);
        });

        it(`falls through from the middle case in a chain`, function() {
          const html = renderFixture(`case`, {variable2: `e`});
          expect(html).to.contain(`bar`);
          expect(html).not.to.contain(`foo`);
        });

        it(`falls through from the last case in a chain`, function() {
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

        it(`runs unbuffered code correctly`, function() {
          expect(html).to.contain(`<div class="example bar">`);
        });

        it(`uses locals when evaluating`, function() {
          html = renderFixture(`code`, {x: 0});
          expect(html).to.contain(`<div class="baz">`);

          html = renderFixture(`code`, {x: -1});
          expect(html).not.to.contain(`<div class="baz">`);
        });

        it(`outputs inline buffered code`, function() {
          expect(html).to.contain(`<div class="inline-script"><div class="raw-inline">within another div`);
        });

        it(`outputs standalone buffered code`, function() {
          expect(html).to.contain(`<div class="raw-buffered">raw so raw`);
        });

        it(`does not output unbuffered code`, function() {
          expect(html).not.to.contain(`should not be output`);
        });
      });

      describe(`multiple files`, function() {
        it(`inserts included literal (non-jade) files`, function() {
          const html = renderFixture(`literal-import`);
          expect(html).to.be(
            `<div class="raw">` +
              `<div class="single-root">` +
                `<div>` + SINGLE_ROOT_IMPORT_HTML + `</div>` +
              `</div>` +
              `<div class="multi-root">` +
                `<div>` + MULTI_ROOT_IMPORT_HTML + `</div>` +
              `</div>` +
            `</div>`
          );
        });
      });
    });
  }
});

describe(`snabbdom-specific rendering`, function() {
  const html = fixtureToHTML(`snabb`, {}, {
    vdom: `snabbdom`,
    snabbArgs: true,
    pretty: true,
  });

  it(`renders plain objects`, function() {
    expect(html).to.contain(`<div>Hello</div>`);
  });

  it(`renders arbitrary attributes`, function() {
    expect(html).to.contain(`bar="baz"`);
  });

  it(`renders properties`, function() {
    expect(html).to.contain(`id="xxx"`);
  });

  it(`translates id-selector notation`, function() {
    expect(html).to.contain(`id="id-example1"`);
  });

  it(`combines id-selector notation with props object`, function() {
    expect(html).to.contain(`id="id-example2"`);
    expect(html).to.contain(`href="link2"`);
  });

  it(`combines classes from jade notation and object notation`, function() {
    expect(html).to.match(/class=".+"/);
    const classes = html.match(/class="(.+?)"/)[1].split(` `);
    expect(classes.sort()).to.eql([`jade-class`, `foo`, `obj-class`].sort());
  });

  it(`renders jade-only class notation`, function() {
    expect(html).to.contain(`<div class="single-class"`);
  });

  it(`renders object-only class notation`, function() {
    expect(html).to.contain(`<a class="aclass"`);
  });

  it(`renders literal imports`, function() {
    expect(html).to.contain(MULTI_ROOT_IMPORT_HTML);
  });
});
