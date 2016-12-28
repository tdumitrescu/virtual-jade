'use strict';

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {

  'snabbdom': {
    literalWrapper: `props`,
    rawProps: true, // don't translate Jade attrs to HTML props
    marshalDataset: false,
    runtime: `var h = require('snabbdom/h');`,
  },

  'virtual-dom': {
    rawProps: false,
    marshalDataset: true,
    runtime: `var h = require('virtual-dom/h');`,
  },

};

module.exports = { VDOM_CONFIG };
