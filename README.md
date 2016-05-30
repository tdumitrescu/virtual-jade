# virtual-jade

[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Compile your [jade](https://github.com/jadejs/jade) templates into [virtual-dom](https://github.com/Matt-Esch/virtual-dom) functions.
For people who like reactive templating, but:

- Don't like writing HTML or JSX
- Want to handle events themselves
- Like modularity and granularity

Create a template:

```jade
.items
  each item in items
    .item(
      className = item.active ? 'active' : ''
      dataset = {
        id: item.id
      })
      .item-title= item.title
      .item-description= item.description
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

- For easy configuration with Webpack, use [virtual-jade-loader](https://github.com/tdumitrescu/virtual-jade-loader).
- Can be used with any CommonJS environment with client-side `require()`s.
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

[travis-image]: https://img.shields.io/travis/tdumitrescu/virtual-jade/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/tdumitrescu/virtual-jade
[coveralls-image]: https://img.shields.io/coveralls/tdumitrescu/virtual-jade.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/tdumitrescu/virtual-jade
