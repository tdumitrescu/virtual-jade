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
  },
  'virtual-dom': {
    rawProps: false,
    dataset: true,
    runtime: `var h = require('virtual-dom/h');`,
  },
};

module.exports = { VDOM_CONFIG };
