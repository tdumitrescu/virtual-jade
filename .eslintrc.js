module.exports = {
  env: {
    node: true,
    es6: true,
  },

  extends: 'eslint:recommended',

  parserOptions: {
    ecmaVersion: 6,
  },

  rules: {
    'arrow-parens':                ['error', 'as-needed'                       ],
    'camelcase':                   ['error', {'properties': 'always'}          ],
    'comma-dangle':                ['error', 'always-multiline'                ],
    'comma-spacing':               ['error', {'before': false, 'after': true}  ],
    'eol-last':                    ['error',                                   ],
    'eqeqeq':                      ['error',                                   ],
    'indent':                      ['error', 2, {SwitchCase: 1}                ],
    'linebreak-style':             ['error', 'unix'                            ],
    'multiline-ternary':           ['error', 'never'                           ],
    'no-console':                  ['warn',  {allow: ['info', 'warn', 'error']}],
    'no-debugger':                 ['warn',                                    ],
    'no-unused-expressions':       ['error',                                   ],
    'no-use-before-define':        ['error', {classes: false}                  ],
    'quotes':                      ['error', 'backtick'                        ],
    'semi':                        ['error', 'always'                          ],
    'space-before-blocks':         ['error', 'always'                          ],
    'space-before-function-paren': ['error', 'never'                           ],
  },
};
