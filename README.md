
# virtual-jade

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]
[![Gittip][gittip-image]][gittip-url]

Server-side function to compile your [jade](https://github.com/jadejs/jade) templates into [virtual-dom](https://github.com/Matt-Esch/virtual-dom) functions.
For people who like reactive templating, but:

- Don't like writing HTML or JSX
- Want to handle events themselves
- Like modularity and granularity

Create a template:

```jade
.Items
  each item in items
    .Item(
      className = item.active ? 'active' : ''
      dataset = {
        id: item.id
      })
      .Item-title= item.title
      .Item-description= item.description
```

`require()` your template as a function
and use a rendering system like [main-loop](https://github.com/Raynos/main-loop):

```js
const mainLoop = require('main-loop')

const render = require('./items.jade')

const initState = {
  items: []
}

const loop = mainLoop(initState, render, {
    create: require("virtual-dom/create-element"),
    diff: require("virtual-dom/diff"),
    patch: require("virtual-dom/patch"),
})
document.body.appendChild(loop.target)
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
    }
  ]
})
```

## Notes

- Requires a CommonJS environment for client-side `require()`s.
- All templates must return a single root element.
- Requires you to install the following modules in your top-level app:
  - [virtual-dom](https://github.com/Matt-Esch/virtual-dom)

## API

### str = render(src, options)

`src` is the jade source.
`str` is output JS that you should include as a CommonJS module.

Options are:

- `.pretty=false` - whether to beautify the resulting JS.
  Requires you to install `js-beautify` yourself.

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
const js = `module.exports = ${src}`
```

[npm-image]: https://img.shields.io/npm/v/virtual-jade.svg?style=flat-square
[npm-url]: https://npmjs.org/package/virtual-jade
[github-tag]: http://img.shields.io/github/tag/jonathanong/virtual-jade.svg?style=flat-square
[github-url]: https://github.com/jonathanong/virtual-jade/tags
[travis-image]: https://img.shields.io/travis/jonathanong/virtual-jade/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/jonathanong/virtual-jade
[coveralls-image]: https://img.shields.io/coveralls/jonathanong/virtual-jade.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jonathanong/virtual-jade
[david-image]: http://img.shields.io/david/jonathanong/virtual-jade.svg?style=flat-square
[david-url]: https://david-dm.org/jonathanong/virtual-jade
[license-image]: http://img.shields.io/npm/l/virtual-jade.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/virtual-jade.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/virtual-jade
[gittip-image]: https://img.shields.io/gratipay/jonathanong.svg?style=flat-square
[gittip-url]: https://gratipay.com/jonathanong/
