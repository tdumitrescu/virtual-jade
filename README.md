# virtual-jade

[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Compile your [jade](https://github.com/jadejs/jade) templates into Virtual DOM functions. Works with multiple Virtual DOM libraries, including:
- [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
- [snabbdom](https://github.com/snabbdom/snabbdom)
- [maquette](https://github.com/AFASSoftware/maquette)

For people who like declarative reactive templating, but don't like writing HTML or JSX.

Create a template:

```jade
.items
  each item in items
    .item(
      class={active: item.active}
      data-id=item.id
    )
      .item-title= item.title
      .item-description= item.description
```

`require()` your template as a function
and use a rendering system like [main-loop](https://github.com/Raynos/main-loop):

```js
const mainLoop = require('main-loop');

const template = require('./items.jade');

const initState = {
  items: [],
};

const loop = mainLoop(initState, template, {
    create: require("virtual-dom/create-element"),
    diff: require("virtual-dom/diff"),
    patch: require("virtual-dom/patch"),
});
document.body.appendChild(loop.target);
```

Then update whenever you'd like!

```js
loop.update({
  items: [
    {
      id: 'asdf',
      title: 'some title',
      description: 'some description',
      active: false,
    },
  ],
});
```

## Notes

- For easy configuration with Webpack, use [virtual-jade-loader](https://github.com/tdumitrescu/virtual-jade-loader).
- To translate with Babel, use [babel-plugin-virtual-jade](https://github.com/jbwyme/babel-plugin-virtual-jade).
- Can be used with any CommonJS environment with client-side `require()`s.
- All templates must return a single root element.
- Requires you to install the appropriate virtual-dom library in your top-level app.

## API

### fnStr = render(str, options)

`str` is the jade source as a string.
`fnStr` is output JS that you should include as a CommonJS module.

Options are:

- `filename`: path and name of Jade source file for `str`.
  Required if you use `include` or `extends` in templates.
- `marshalDataset=true`: whether to convert `data-` attributes
  to `dataset` members. Set to false to treat as props with the same
  name as the attributes (if your target Virtual DOM renderer does
  not support the `dataset` API).
- `pretty=false`: whether to beautify the resulting JS.
  Requires you to install `js-beautify` yourself.
- `propsWrapper`: optional object to wrap Jade attributes in; for example, with `propsWrapper = 'props'`, the template `div(foo="bar")` will translate to something like `h('div', {props: {foo: 'bar'}})` rather than `h('div', {foo: 'bar'})`
- `rawProps`: whether to skip Jade attribute -> HTML property conversion; this is set to true in the default Snabbdom configuration
- `runtime`: optional override to include any arbitrary Virtual DOM library that defines the `h()` hyperscript function. E.g. `var h = require('my-special-lib/h');`
- `vdom`: name of the Virtual DOM library configuration to load (currently either `virtual-dom` or `snabbdom`).

Returns a string that looks like:

```js
function render(locals) {
  var result_of_with = /* stuff */
  if (result_of_with) return result_of_with.value;;
}
```

You are expected to `eval()` the string if you want the source as a function.
Otherwise, just create a module in the following format:

```js
const js = `module.exports = ${fnStr}`;
```

[travis-image]: https://img.shields.io/travis/tdumitrescu/virtual-jade/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/tdumitrescu/virtual-jade
[coveralls-image]: https://img.shields.io/coveralls/tdumitrescu/virtual-jade.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/tdumitrescu/virtual-jade
