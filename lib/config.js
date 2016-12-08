'use strict';

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {
  'snabbdom': {
    rawProps: true, // don't translate attrs
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
