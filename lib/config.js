'use strict'

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {
  'snabbdom': {
    dataset: false,
    runtime: `var h = require('snabbdom/h');`,
  },
  'virtual-dom': {
    dataset: true,
    runtime: `var h = require('virtual-dom/h');`,
  },
}

module.exports = { VDOM_CONFIG }
