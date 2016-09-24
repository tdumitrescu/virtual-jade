'use strict'

/**
 * Configurations for Virtual DOM libraries.
 * You are expected to install runtimes yourself.
 */
const VDOM_CONFIG = {
  'snabbdom': {
    propsWrapper: 'props',
    runtime: `var h = require('snabbdom/h');`,
  },
  'virtual-dom': {
    runtime: `var h = require('virtual-dom/h');`,
  },
}

module.exports = { VDOM_CONFIG }
