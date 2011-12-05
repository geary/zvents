//-------------------------------------------------------------------------------------------------
// Scriptola Base
// Copyright 2007 Michael Geary
// Free beer and free speech license (MIT+GPL). Enjoy!
//-------------------------------------------------------------------------------------------------

var _;
window.global = window;

//-------------------------------------------------------------------------------------------------

Function.prototype.methods = function( methods ) {
  for( var name in methods || {} )
    this.prototype[name] = methods[name];
  return this;
};

//-------------------------------------------------------------------------------------------------

Function.methods({
  extend: function( base, methods ) {
    this.prototype = Object.inherit( base.prototype );
    this.prototype.constructor = this;
    this.statics({ _base: base, _super: base.prototype });
    this.methods( methods );
  },

  statics: function( methods ) {
    for( var name in methods || {} )
      this[name] = methods[name];
    return this;
  },

  addMethods: function( methods ) {
    for( var name in methods || {} )
      if( ! this.prototype[name] )
        this.prototype[name] = methods[name];
    return this;
  },

  addStatics: function( methods ) {
    for( var name in methods || {} )
      if( ! this[name] )
        this[name] = methods[name];
    return this;
  }
});

//-------------------------------------------------------------------------------------------------

Function.statics({
  replace: function( obj, methods ) {
    for( var name in methods ) {
      var old =  obj['_'+name] = obj[name];
      var method = obj[name] = methods[name];
      if( old.prototype ) old.prototype.constructor = method;
    }
  }
});

//-------------------------------------------------------------------------------------------------

Object.statics({
  add: function( self ) {
    return Object.extendFromArray( self, arguments, false, 1 );
  },

  combine: function() {
    return Object.extendFromArray( {}, arguments, true, 0 );
  },

  copy: function( from ) {
    return Object.combine( from );
  },

  copyNamed: function( args, names ) {
    var p = {};
    for( var name in names )
      if( args[name] != null )
        p[name] = args[name];
    return p;
  },

  extendFromArray: function( self, array, always, start, stop ) {
    stop = stop || array.length;
    for( var i = start;  i < stop;  i++ ) {
      var obj = array[i];
      if( obj )
        for( var prop in obj )
          if( always  ||  self[prop] === undefined )
            self[prop] = obj[prop];
    }
    return self;
  },

  extend: function( self ) {
    return Object.extendFromArray( self, arguments, true, 1 );
  },

  inherit: function( o ) {
    function f() {}
    f.prototype = o;
    return new f;
  },

  isEmpty: function( o ) {
    if( o ) for( var i in o ) return false;
    return true;
  }
});

//-------------------------------------------------------------------------------------------------

String.methods({
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },

  htmlEscape: function() {
    //return this/*.replace( /&/g, "&amp;" )*/
    //  .replace( /\"/g, "&quot;" )
    //  .replace( />/g, "&gt;" )
    //  .replace( /</g, "&lt;" );
    var div = document.createElement( 'div' );
    div.appendChild( document.createTextNode(this) );
    return div.innerHTML;
  },

  htmlFix: function() {
    return this.unescapePlus().htmlEscape();
  },

  pad: function( n ) {
    return this.slice( 0, n );
  },

  strip: function() {
    var m = this.match(/^\s*([^\s]*)\s*$/);
    return m ? m[1] : '';
  },

  // TODO: tag vs. wrap?
  tag: function( attrs, inner ) {
    var a = [];
    for( var name in attrs ) {
      var value = attrs[name];
      name = { Class:'class' }[name] || name;
      a.push( [ ' ', name, '="', value, '"' ].join() );
    }
    a = a.join();

    return( inner == null ? [
      '<', this, a, ' />'
    ] : [
      '<', this, a, '>', inner, '</', this, '>'
    ] ).join();
  },

  truncate: function( n, escape) {
    var len = this.length;
    if( typeof n != 'number'  ||  len <= n ) return this + '';
    var s = this.substring( 0, n + 1 ).replace( / +[\w]+$/, '' ).replace( /[ :;,.]*$/, '' );
    if( escape ) s = s.htmlEscape();
    return s + String.ellipsis;
  },

  unescapePlus: function() {
    return unescape( this ).replace( /\+/g, ' ' );
  },

  //urlEscape: function() {
  //   return this.replace( /&/g, "&amp;" );
  //},

  unhash: function() {
    return this.replace( /^#/, '' );
  },

  //unquery: function() {
  //  return this.replace( /^\?/, '' );
  //},

  words: function( yields, delim ) {
    return this.split( delim != null ? delim : ' ' ).each( yields );
  },

  wrap: function( clas, tag ) {
    tag = tag || 'div';
    return [ '<', tag, ' class="', clas, '">', this, '</', tag, '>' ].join();
  }
});

//-------------------------------------------------------------------------------------------------

String.statics({
  ellipsis: '&#8230;',
  enDash: '&#8211;',
  nbsp: '&#160;'
});

//-------------------------------------------------------------------------------------------------

Array.addMethods({
//  //filter: function( fn, that ) {
//  //  var n = this.length;
//  //  var out = [];
//  //  for( var i = 0;  i < n;  i++ ) {
//  //    var v = this[i];
//  //    if( fn.call( that, v, i, this ) )
//  //      out.push( v );
//  //  }
//  //  return res;
//  //},
//
//  //indexOf: function( value, i ) {
//  //  var n = this.length;
//  //  i = i || 0;
//  //  if( i < n ) {
//  //    if( i < 0 ) i = n + i;
//  //    if( i < 0 ) i = 0;
//  //    for( ;  i < n;  i++ )
//  //      if( this[i] === value )
//  //        return i;
//  //  }
//  //  return -1;
//  //},

  map: function( fn, that ) {
    var out = [];
    for( var i = 0, n = this.length;  i < n;  i++ ) {
      out.push( fn.call( that, this[i], i, this ) );
    }
    return out;
  }

//  pop: function() {
//    var v = this[this.length-1];
//    this.length--;
//    return v;
//  },
//
//  push: function() {
//    for( var i = 0, len = arguments.length;  i < len;  i++ ) {
//      this[this.length] = arguments[i];
//    }
//    return this.length;
//  }
});

//-------------------------------------------------------------------------------------------------

Array.methods({
  //// Return a compacted copy of an array, with null and undefined elements removed
  //compact: function() {
  //  var a = [];
  //  for( var i = 0, n = this.length;  i < n;  i++ ) {
  //    var x = this[i];
  //    if( x != null ) a[a.length] = x;
  //  }
  //  return a;
  //},

  // Return a compacted copy of an array, with null, undefined, and empty string elements removed
  compacts: function() {
    var a = [];
    for( var i = 0, n = this.length;  i < n;  i++ ) {
      var x = this[i];
      if( x != null && x != '' ) a[a.length] = x;
    }
    return a;
  },

  each: function( yields ) {
    var n = this.length, last = n - 1;
    var is = { first: true };
    for( var e = 0;  e < n;  e++ ) {
      if( e == last ) is.last = true;
      if( yields( this[e], is ) === false ) break;
      delete is.first;
    }
    return n;
  },

  //eachr: function( yields ) {
  //  var n = this.length;
  //  var is = { last: true };
  //  for( var e = this.length - 1;  e >= 0;  e-- ) {
  //    if( e == 0 ) is.first = true;
  //    if( yields( this[e], is ) === false ) break;
  //    delete is.last;
  //  }
  //  return n;
  //},

  //equals: function( that ) {
  //  if( ! that ) return false;
  //  var i = this.length;
  //  if( i != that.length ) return false;
  //  while( --i >= 0 ) if( this[i] != that[i] ) return false;
  //  return true;
  //},

  index: function( key ) {
    var self = this;
    key = key || 'id';

    Object.extend( self, {
      by: {},

      push: function() {
        for( var i = 0, len = arguments.length;  i < len;  i++ ) {
          var item = arguments[i];
          var value = item[key];
          if( value ) this.by[value] = item;
          this[this.length] = item;
        }
        return this.length;
      }
    });

    self.each( function( item ) {
      var value = item[key];
      if( value ) self.by[value] = item;
    });

    return self;
  },

  pushif: function() {
    for( var i = 0, len = arguments.length;  i < len;  i++ ) {
      var item = arguments[i];
      if( item ) this.push( item );
    }
  }

});

//-------------------------------------------------------------------------------------------------

Function.replace( Array.prototype, {
  join: function( sep ) {
    return this._join( sep != null ? sep : '' );
  }
});

//-------------------------------------------------------------------------------------------------

Array.statics({
  //// Concatenate two arrays
  //concat: function( a, b ) {
  //  var r = [];
  //  append( r, a );
  //  append( r, b );
  //  return r;
  //
  //  function append( r, a ) {
  //    if( a ) for( var i = 0, len = a.len;  i < len;  i++ ) r[r.length] = a[i];
  //  }
  //},

  of: function( a ) {
    return typeof a == 'object' && a.length != undefined ? a : [a];
  }
});

//-------------------------------------------------------------------------------------------------

Object.extend( Math, {
  randomString: function( length, base ) {
    return Math.floor( Math.random() * Math.pow(base,length) ).toString( base );
  },

  roundDownOdd: function( value ) {
    return Math.floor( value - 1 ) | 1;
  }
});

//-------------------------------------------------------------------------------------------------

Number.methods({
  pad: function( n ) {
    return n == null ? this : ( 1000000000 + this + '' ).slice( -n );
  },

  toFixed: function( digits, round ) {
    var value = this + 0;
    if( round ) value += Math.pow( 10, -digits ) / 2;
    var s = '' + value;
    var iDec = s.indexOf('.') + 1;
    if( ! iDec ) { s += '.';  iDec = s.length; }
    for( var zeroes = s.length - iDec + digits;  zeroes > 0;  zeroes-- ) { s += '0'; }
    return s.slice( 0, iDec + digits );
  }
});

//-------------------------------------------------------------------------------------------------
