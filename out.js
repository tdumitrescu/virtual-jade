yarn run v1.13.0
$ mocha


  Compiler
return h("div",{"ev-click":function (e) {
    console.log(e)
  },"className":[].concat('item').filter(Boolean).join(' '),})
    ✓ compiles functions as properties
    ✓ throws if there is not exactly 1 tag
return h("html",{"className":[].concat('no-js').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("head", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("meta",{"charset":'utf-8',}));__jade_nodes = __jade_nodes.concat(h("meta",{"httpEquiv":'X-UA-Compatible',"content":'IE=edge',}));__jade_nodes = __jade_nodes.concat(h("title"));__jade_nodes = __jade_nodes.concat(h("meta",{"name":'description',"content":'',}));__jade_nodes = __jade_nodes.concat(h("meta",{"name":'viewport',"content":'width=device-width, initial-scale=1',}));__jade_nodes = __jade_nodes.concat(h("link",{"rel":'stylesheet',"href":'stylesheets/normalize.css',}));__jade_nodes = __jade_nodes.concat(h("link",{"rel":'stylesheet',"href":'stylesheets/main.css',}));/* script(src='javascripts/vendor/modernizr-2.7.1.min.js') */
;return __jade_nodes}).call(this).filter(Boolean)));__jade_nodes = __jade_nodes.concat(h("body", (function() {var __jade_nodes = [];/*  Add your site or application content here */
__jade_nodes = __jade_nodes.concat(h("p", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("Hello world! This is HTML5 Boilerplate.");;return __jade_nodes}).call(this).filter(Boolean)));__jade_nodes = __jade_nodes.concat(h("script",{"src":'//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',}));__jade_nodes = __jade_nodes.concat(h("script", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("window.jQuery || document.write('<script src=\"javascripts/vendor/jquery-1.11.0.min.js\"><\\/script>')");;return __jade_nodes}).call(this).filter(Boolean)));/* script(src='javascripts/plugins.js') */
/* script(src='javascripts/script.js') */
/*  Google Analytics: change UA-XXXXX-X to be your site's ID. */
/* script
  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
  e=o.createElement(i);r=o.getElementsByTagName(i)[0];
  e.src='//www.google-analytics.com/analytics.js';
  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
  ga('create','UA-XXXXX-X');ga('send','pageview');*/
;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles the boilerplate

      var __vjadeObjToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      return h("div",{"id":'id',"required":true,"something":false,"className":[].concat('class1').concat(['1', '2', variable]).filter(Boolean).join(' '),"dataset":{"fooId":42,"var":variable,},}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat([foo, bar]).concat(baz).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat(__vjadeObjToAttrs({obj1: true, obj2: variable === 'doge'})).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('mixed').concat(__vjadeObjToAttrs({
      mixedObj1: !!var2
    })).concat(['mixedArray1', var2]).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("input",{"id":'special-attr',"autocomplete":"on","tabIndex":5,}));__jade_nodes = __jade_nodes.concat(h("label",{"htmlFor":"special-attr",}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("boo");;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles attributes

      var __vjadeObjToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      return h("div",{"id":'id',"required":true,"something":false,"className":[].concat('class1').concat(['1', '2', variable]).filter(Boolean).join(' '),"dataset":{"fooId":42,"var":variable,},}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat([foo, bar]).concat(baz).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat(__vjadeObjToAttrs({obj1: true, obj2: variable === 'doge'})).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('mixed').concat(__vjadeObjToAttrs({
      mixedObj1: !!var2
    })).concat(['mixedArray1', var2]).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("input",{"id":'special-attr',"autocomplete":"on","tabIndex":5,}));__jade_nodes = __jade_nodes.concat(h("label",{"htmlFor":"special-attr",}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("boo");;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles data attributes to dataset

      var __vjadeObjToAttrs = function(o) {
        return Object.keys(o).map(function(k) { return o[k] ? k : false});
      };
      return h("div",{"id":'id',"required":true,"something":false,"data-foo-id":42,"data-var":variable,"className":[].concat('class1').concat(['1', '2', variable]).filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat([foo, bar]).concat(baz).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat(__vjadeObjToAttrs({obj1: true, obj2: variable === 'doge'})).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('mixed').concat(__vjadeObjToAttrs({
      mixedObj1: !!var2
    })).concat(['mixedArray1', var2]).filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("input",{"id":'special-attr',"autocomplete":"on","tabIndex":5,}));__jade_nodes = __jade_nodes.concat(h("label",{"htmlFor":"special-attr",}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("boo");;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ optionally does not compile data attributes to dataset
return h("p", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("How many wombats? " + (x + 5) + " wombats? Really? OK, " + (x - 2) + " wombats...");;return __jade_nodes}).call(this).filter(Boolean))
    ✓ handles basic string interpolation
return h("div", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(( true) ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("span"));__jade_nodes = __jade_nodes.concat(h("span"));;return __jade_nodes}).call(this)) : ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("em"));;return __jade_nodes}).call(this)));__jade_nodes = __jade_nodes.concat(( false) ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div"));;return __jade_nodes}).call(this)) : undefined);__jade_nodes = __jade_nodes.concat(( 1) ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"id":'a1',}));;return __jade_nodes}).call(this)) : ( 2) ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"id":'a2',}));;return __jade_nodes}).call(this)) : ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"id":'a3',}));;return __jade_nodes}).call(this)));;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles if statements
return h("div", (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat((((variable) == (1)))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("span"));;return __jade_nodes}).call(this))
        : (((variable) == (2)))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("input"));;return __jade_nodes}).call(this))
        : ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("textarea"));;return __jade_nodes}).call(this)));__jade_nodes = __jade_nodes.concat((((variable2) == ('a')))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("br"));;return __jade_nodes}).call(this))
        : (((variable2) == ('b')) || ((variable2) == ('c')))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('foo').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this))
        : (((variable2) == ('d')) || ((variable2) == ('e')) || ((variable2) == ('f')))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('bar').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this))
        : undefined);__jade_nodes = __jade_nodes.concat((((variable3) == (3)) || ((variable3) == (4)))
        ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('baz').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this))
        : ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('llama').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this)));;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles case statements
var a = 1;
var b = 2;
return h("div")
    ✓ compiles top-level JS

      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div", (function() {var __jade_nodes = [];var foo = ['bar'];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('example').concat(foo).filter(Boolean).join(' '),}));var baz = x + 1;var z = [
  1,
  2,
  3
];__jade_nodes = __jade_nodes.concat(( baz) ? ((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('baz').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this)) : undefined);__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('inline-script').filter(Boolean).join(' '),}, [__vjadeSafeCode(h('.raw-inline', 'within another div'))]));__jade_nodes = __jade_nodes.concat(h('.raw-buffered', 'raw so raw'));h('.unbuffered', 'should not be output');__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('empty-code').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat("");;return __jade_nodes}).call(this).filter(Boolean)));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('buffered-null').filter(Boolean).join(' '),}, [__vjadeSafeCode(null)]));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles JS in blocks
return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat((function() {
    var $$obj = (items);
    var $$eachNodes;
    var $$iterated = false;
    if (Array.isArray($$obj)) {
      $$eachNodes = $$obj.reduce(function($$eachNodes, item, $index) {
        $$iterated = true;
        return $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div"));;return __jade_nodes}).call(this));
      }, []);
    } else {
      $$eachNodes = [];
      for (var $$objKey in $$obj) {
        (function() {
          var $index = $$objKey;
          if ($$obj.hasOwnProperty($index)) {
            $$iterated = true;
            var item = $$obj[$index];
            $$eachNodes = $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div"));;return __jade_nodes}).call(this));
          }
        })();
      }
    }
  
    return $$eachNodes;
  })());;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles each
return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat((function() {
    var $$obj = (items);
    var $$eachNodes;
    var $$iterated = false;
    if (Array.isArray($$obj)) {
      $$eachNodes = $$obj.reduce(function($$eachNodes, item, anIndex) {
        $$iterated = true;
        return $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div"));;return __jade_nodes}).call(this));
      }, []);
    } else {
      $$eachNodes = [];
      for (var $$objKey in $$obj) {
        (function() {
          var anIndex = $$objKey;
          if ($$obj.hasOwnProperty(anIndex)) {
            $$iterated = true;
            var item = $$obj[anIndex];
            $$eachNodes = $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div"));;return __jade_nodes}).call(this));
          }
        })();
      }
    }
  
    return $$eachNodes;
  })());;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles each, index

      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat((function() {
    var $$obj = (values.length ? values : ['There are no values']);
    var $$eachNodes;
    var $$iterated = false;
    if (Array.isArray($$obj)) {
      $$eachNodes = $$obj.reduce(function($$eachNodes, val, $index) {
        $$iterated = true;
        return $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("li", [__vjadeSafeCode(val)]));;return __jade_nodes}).call(this));
      }, []);
    } else {
      $$eachNodes = [];
      for (var $$objKey in $$obj) {
        (function() {
          var $index = $$objKey;
          if ($$obj.hasOwnProperty($index)) {
            $$iterated = true;
            var val = $$obj[$index];
            $$eachNodes = $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("li", [__vjadeSafeCode(val)]));;return __jade_nodes}).call(this));
          }
        })();
      }
    }
  
    return $$eachNodes;
  })());;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles each w/ expressions
return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];var i = 0;__jade_nodes = __jade_nodes.concat((function(){
            var buf = [];
            while (i < 5) {
              buf = buf.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').filter(Boolean).join(' '),}));i++;;return __jade_nodes}).call(this))
            }
            return buf
          }).call(this));;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles a while loop
var jade_mixins = {};
      jade_mixins['item'] = function() {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        
        return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('more-tree').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this);
      };
    return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this));__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this));;return __jade_nodes}).call(this).filter(Boolean))
    ✓ compiles mixins without arguments
var jade_mixins = {};
      jade_mixins['item'] = function(x) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        
        return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('more-tree').filter(Boolean).join(' '),}, [__vjadeSafeCode(x + 1)]));;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this);
      };
    
      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this, 5));__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this, 6));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles mixins with arguments
var jade_mixins = {};
      jade_mixins['item'] = function(x) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        
        var myList = [];
        for (var jade_interp = 1; jade_interp < arguments.length; jade_interp++) {
          myList.push(arguments[jade_interp]);
        }
      
        return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat((function() {
    var $$obj = (myList);
    var $$eachNodes;
    var $$iterated = false;
    if (Array.isArray($$obj)) {
      $$eachNodes = $$obj.reduce(function($$eachNodes, el, $index) {
        $$iterated = true;
        return $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('more-tree').filter(Boolean).join(' '),}, [__vjadeSafeCode(el)]));;return __jade_nodes}).call(this));
      }, []);
    } else {
      $$eachNodes = [];
      for (var $$objKey in $$obj) {
        (function() {
          var $index = $$objKey;
          if ($$obj.hasOwnProperty($index)) {
            $$iterated = true;
            var el = $$obj[$index];
            $$eachNodes = $$eachNodes.concat((function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('more-tree').filter(Boolean).join(' '),}, [__vjadeSafeCode(el)]));;return __jade_nodes}).call(this));
          }
        })();
      }
    }
  
    return $$eachNodes;
  })());;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this);
      };
    
      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this, 5, 'a', 'b'));__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call(this, 6, 'c'));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles mixins with rest arguments
var jade_mixins = {};
      jade_mixins['item'] = function(x) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        
        return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('more-tree').filter(Boolean).join(' '),}, [__vjadeSafeCode(x)]));__jade_nodes = __jade_nodes.concat(block && block());;return __jade_nodes}).call(this).filter(Boolean)));;return __jade_nodes}).call(this);
      };
    
      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call({block: function() { return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('foo').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this); }}, 5));__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call({block: function() { return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('bar').filter(Boolean).join(' '),}));__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('baz').filter(Boolean).join(' '),}));;return __jade_nodes}).call(this); }}, 6));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles mixins with blocks
var jade_mixins = {};
      jade_mixins['item'] = function(x) {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        
        return (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(h("div",{"className":[].concat('item').concat(attributes.className).filter(Boolean).join(' '),}, [__vjadeSafeCode(x)]));;return __jade_nodes}).call(this);
      };
    
      var __vjadeSafeCode = function(code) {
        return code || String(code);
      };
      return h("div",{"className":[].concat('items').filter(Boolean).join(' '),}, (function() {var __jade_nodes = [];__jade_nodes = __jade_nodes.concat(jade_mixins['item'].call({attributes: {"className":[].concat("foo").filter(Boolean).join(' '),}}, 5));;return __jade_nodes}).call(this).filter(Boolean))
    
    ✓ compiles mixins with attributes

  configuration
    ✓ throws when an invalid vdom config is supplied
    ✓ throws a parser error with filename and line number when rendering a broken template
    ✓ throws a compiler error with filename and line number when rendering a broken template
    ✓ renders a template without options

  rendering
    using library "virtual-dom"
      ✓ renders a template
      ✓ beautifies when option is set
      ✓ inserts dynamic tag names
      ✓ renders a simple template
      ✓ translates basic class notation
      ✓ renders falsey numeric values
      iteration
        ✓ runs "each" loops correctly
        ✓ runs "while" loops correctly
        ✓ runs "else" block if no iteration occurred
        over object key/value pairs
          ✓ works with object literals
          ✓ works with object variables
          ✓ runs "else" block if no iteration occurred
      multiple files
        ✓ inserts included files
        ✓ makes included mixins available
        ✓ inserts extended files
      attributes
        ✓ adds arbitrary attributes
        ✓ adds class attributes in array notation
        ✓ adds class attributes in object notation
        ✓ combines class attributes in different notations gracefully
        ✓ renders data attributes
        ✓ converts attributes to correct property names
      case statements
        ✓ does not execute any cases when none match
        ✓ executes default when no others match
        ✓ executes only one match
        ✓ falls through from the first case in a chain
        ✓ falls through from the middle case in a chain
        ✓ falls through from the last case in a chain
      code blocks
        ✓ runs unbuffered code correctly
        ✓ uses locals when evaluating
        ✓ outputs inline buffered code
        ✓ outputs standalone buffered code
        ✓ does not output unbuffered code
      multiple files
        ✓ inserts included literal (non-jade) files
    using library "snabbdom"
      ✓ renders a template
      ✓ beautifies when option is set
      ✓ inserts dynamic tag names
      ✓ renders a simple template
      ✓ translates basic class notation
      ✓ renders falsey numeric values
      iteration
        ✓ runs "each" loops correctly
        ✓ runs "while" loops correctly
        ✓ runs "else" block if no iteration occurred
        over object key/value pairs
          ✓ works with object literals
          ✓ works with object variables
          ✓ runs "else" block if no iteration occurred
      multiple files
        ✓ inserts included files
        ✓ makes included mixins available
        ✓ inserts extended files
      attributes
        ✓ adds arbitrary attributes
        ✓ adds class attributes in array notation
        ✓ adds class attributes in object notation
        ✓ combines class attributes in different notations gracefully
        ✓ renders data attributes
        ✓ converts attributes to correct property names
      case statements
        ✓ does not execute any cases when none match
        ✓ executes default when no others match
        ✓ executes only one match
        ✓ falls through from the first case in a chain
        ✓ falls through from the middle case in a chain
        ✓ falls through from the last case in a chain
      code blocks
        ✓ runs unbuffered code correctly
        ✓ uses locals when evaluating
        ✓ outputs inline buffered code
        ✓ outputs standalone buffered code
        ✓ does not output unbuffered code
      multiple files
        ✓ inserts included literal (non-jade) files

  snabbdom-specific rendering
    ✓ renders plain objects
    ✓ renders arbitrary attributes
    ✓ renders properties
    ✓ translates id-selector notation
    ✓ combines id-selector notation with props object
    ✓ combines classes from jade notation and object notation
    ✓ renders jade-only class notation
    ✓ renders object-only class notation
    ✓ renders literal imports


  99 passing (571ms)

Done in 2.41s.
