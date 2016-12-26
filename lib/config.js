'use strict';

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {

  'snabbdom': {
    rawProps: true, // don't translate Jade attrs to HTML props
    dataset: false,
    runtime: `var h = require('snabbdom/h');`,
    generateLiteral: `
      function generateLiteral(id, contents) {
        return h('div', 'HELLO WORLD');
      }
    `,
  },

  'virtual-dom': {
    rawProps: false,
    dataset: true,
    runtime: `var h = require('virtual-dom/h');`,
    generateLiteral: `
      function generateLiteral(id, contents) {
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
      }
    `,
  },

};

module.exports = { VDOM_CONFIG };
