'use strict';

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {

  'snabbdom': {
    rawProps: true, // don't translate Jade attrs to HTML props
    marshalDataset: false,
    runtime: `var h = require('snabbdom/h');`,
    generateLiteral: `
      function generateLiteral(contents) {
        return h('div', {props: {innerHTML: contents}});
      }
    `,
  },

  'virtual-dom': {
    rawProps: false,
    marshalDataset: true,
    runtime: `var h = require('virtual-dom/h');`,
    generateLiteral: `
      function generateLiteral(contents) {
        return h('div', {innerHTML: contents});
      }
    `,
  },

};

module.exports = { VDOM_CONFIG };
