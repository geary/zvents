//-------------------------------------------------------------------------------------------------
// Scriptola DOM
// By Michael Geary - https://github.com/geary
// See UNLICENSE or http://unlicense.org/ for public domain notice.
//-------------------------------------------------------------------------------------------------
// Requires Scriptola Base
//-------------------------------------------------------------------------------------------------

parent.jQuitoData = global.jQuitoData = {};

//-------------------------------------------------------------------------------------------------

function $ZJQuery() {
  return new $ZJQuery.$ZJQuery( arguments );
};

//-------------------------------------------------------------------------------------------------

(function() {
  var ua = navigator.userAgent.toLowerCase();
  var b = $ZJQuery.browser = {
    //konq: ver('konqueror'),
    opera: ver('opera'),
    safari: ver('safari'),
    webkit: ver('applewebkit')
  };
  var ie = b.msie = ! b.opera  &&  ver('msie');
  b.iePngHack = ie >= 5.5  &&  ie < 7.0  &&  ! b.opera;
  b.mozilla = ! b.webkit  &&  ! /compatible/.test(ua)  &&  ver('mozilla');

  function ver( name ) {
    var i = ua.indexOf( name );
    if( i < 0 ) return false;
    i += name.length + 1;
    var dots = 0;
    for( var j = i;  use(ua.charAt(j));  j++ ) {}
    return 0 + ua.substring( i, j );

    function use( c ) {
      return c == '.' ? dots++ == 0 : c >= '0' && c <= '9';
    }
  }
})();

//-------------------------------------------------------------------------------------------------

$ZJQuery.statics({
  window: window.parent,
  document: window.parent.document,

  addScript: function( url, doc ) {
    //$ZJQuery('head',document).append(
    //  $ZJQuery.SCRIPT({ type:'text/javascript', charset:'utf-8', src:url })
    //);
    doc = doc || document;
    var script = doc.createElement( 'script' );
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = url;
    $ZJQuery.headOrBody(doc).appendChild( script );
    return script;
  },

  args: function( key, val, yields ) {
    switch( typeof key ) {
      case 'string':
        yields( key, val );
        break;
      case 'object':
        for( var k in key )
          yields( k, key[k] );
        break;
    }
  },

  // Return an element's bounding box in pixels, relative to a root element or the document
  // TODO: bounding box for multiple elements
  box: function( e, root ) {
    if( ! e ) return;
    var x = 0, y = 0, cx = e.offsetWidth, cy = e.offsetHeight;
    if( e.nodeType != 1 ) e = e.parentNode;
    while( e ) {
      x += e.offsetLeft;
      y += e.offsetTop;
      e = e.offsetParent;
    }
    if( root ) {
      var boxRoot = $ZJQuery.box( root );
      x -= boxRoot.x;
      y -= boxRoot.y;
    }
    return { x:x, y:y, cx:cx, cy:cy };
  },

  hasClass: function( e, c ) {
    return new RegExp( '(^|\\s)' + c + '(\\s|$)' ).test( e.className || '' );
  },

  headOrBody: function( doc ) {
    var h = doc.getElementsByTagName( 'head' );
    return h && h[0] || doc.body;
  },

  mouseunframe: function( e ) {
    var mouse = { x: e.clientX, y: e.clientY };
    var doc = e.srcElement.ownerDocument;
    var win = doc.parentWindow || doc.defaultView;
    var frame = win.frameElement;
    if( frame ) {
      var bounds = $ZJQuery.box( frame );
      mouse.x += bounds.x;
      mouse.y += bounds.y;
    }
    return mouse;
  },

  parent: function( e, tag, top ) {
    while( e && e != top ) {
      if( e.tagName.toLowerCase() == tag )
        return e;
      e = e.parentNode;
    }
  },

  viewport: function() {
    var e = $ZJQuery.document.documentElement || {},
      b = $ZJQuery.document.body || {},
      w = $ZJQuery.window;

    return {
      x: w.pageXOffset || e.scrollLeft || b.scrollLeft || 0,
      y: w.pageYOffset || e.scrollTop || b.scrollTop || 0,
      cx: min( e.clientWidth, b.clientWidth, w.innerWidth ),
      cy: min( e.clientHeight, b.clientHeight, w.innerHeight )
    };

    function min() {
      var v = Infinity;
      for( var i = 0;  i < arguments.length;  i++ ) {
        var n = arguments[i];
        if( n && n < v ) v = n;
      }
      return v;
    }
  }
});

//-------------------------------------------------------------------------------------------------

$ZJQuery.$ = function( args ) {
  var self = this;
  var win = $ZJQuery.window;

  function add( a ) {
    switch( typeof a ) {
      case 'string':
        var _id = a.split( '#' ), id = _id[1];
        if( id ) {
          var e = win.document.getElementById( id );
          if( e ) self[self.length++] = e;
        }
        //else {
        //  var tag_class = a.split( '.' ), tag = tag_class[0], class = tag_class[1];
        //  var els = ( context || document ).getElementsByTagName( tag || '*' );
        //  for( var j = 0, jN = els.length;  j < jN;  j++ )
        //    if(
        //}
        break;
      default:
        self[self.length++] = a;
        break;
    }
  }

  self.length = 0;
  self.handlers = {};

  for( var i = 0, iN = args.length;  i < iN;  i++ ) {
    var all = args[i];
    if( all && all.window ) {
      win = all;
    }
    else if( typeof all == 'string' ||  all.length == null ) {
      add( all );
    }
    else {
      for( var j = 0, jN = all.length;  j < jN;  j++ )
        add( all[j] );
    }
  }

  self.e = self[0];
};

//-------------------------------------------------------------------------------------------------

$ZJQuery.$ZJQuery.prototype = {
  addClass: function( c ) {
    return this.each( function( e ) {
      if( ! $ZJQuery.hasClass( e, c ) ) {
        var n = e.className;
        e.className = n ? n + ' ' + c : c;
      }
    });
  },

  css: function( styles ) {
    return this.each( function( e ) {
      var es = e.style;
      for( var name in styles ) {
        var style = styles[name];
        es[name] = style;
      }
    });
  },

  each: function( yields ) {
    for( var i = 0, n = this.length;  i < n;  i++ )
      yields( this[i], i );
    return this;
  },

  each$: function( yields ) {
    for( var i = 0, n = this.length;  i < n;  i++ ) {
      var e = this[i];
      yields( $ZJQuery(e), e, i );
    }
    return this;
  },

  // TODO: use $ZJQuery.anchor?
  findParent: function( top, patterns ) {
    for( var e = this.e;  e && e != top;  e = e.parentNode ) {
      var c = e.className;
      for( var type in patterns ) {
        var m = c.match( patterns[type] );
        if( m ) { var r = {};  r[type] = m[1];  return r; }
      }
    }
  },

  hasClass: function( c ) {
    var has = false;
    this.each( function( e ) {
      if( $ZJQuery.hasClass( e, c ) ) {
        has = true;
        return false;
      }
    });
    return has;
  },

  hide: function() {
    return this.each( function( e ) {
      e.style.display = 'none';
    });
  },

  html: function( html ) {
    this.off();
    return this.each( function( e ) {
      e.innerHTML = html;
    });
  },

  on: function( type, f, args ) {
    if( this.handlers[type] ) return this;
    var handler = this.handlers[type] = $ZJQuery.event.handler( type, f );
    if( handler.custom ) {
      handler = handler.custom( this, f, args || {} );
      handler.on && handler.on();
      return this;
    }
    return this.each( function( e ) {
      if( e.addEventListener )
        e.addEventListener( type, handler.dom, false );
      else if( e.attachEvent )
        e.attachEvent( 'on' + type, handler.dom );
    });
  },

  off: function() {
    var self = this;
    var n = arguments.length;
    if( n ) for( var i = 0;  i < n;  i++ ) off( arguments[i] );
    else for( type in self.handlers ) off( type );
    return self;

    function off( type ) {
      var handler = self.handlers[type];
      if( ! handler ) return;
      delete self.handlers[type];
      if( handler.off ) {
        handler.off();
        return;
      }
      self.each( function( e ) {
        if( e.removeEventListener )
          e.removeEventListener( type, handler.dom, false );
        else if( e.detachEvent )
          e.detachEvent( 'on' + type, handler.dom );
      });
    }
  },

  remove: function() {
    return this.each( function( e ) {
      e.parentNode && e.parentNode.removeChild( e );
    });
  },

  box: function( root ) {
    return $ZJQuery.box( this.e, root );
  },

  isIn: function() {
    var child = this.e;
    var len = arguments.length;
    while( child ) {
      for( var i = 0;  i < len;  i++ )
        if( child == arguments[i] ) return true;
      child = child.parentNode;
    }
    return false;
  },

  hitTest: function( xIn, yIn ) {
    for( var i = 0, len = this.length;  i < len;  i++ ) {
      var e = this[i];
      var box = $ZJQuery.box( e );
      // TODO: refactor
      var x = xIn - box.x;
      var y = yIn - box.y;
      if( x >= 0 && x < box.cx && y >= 0 && y < box.cy ) {
        return { element:e, x:x, y:y };
      }
    }
  },

  parent: function( tag, top ) {
    return $ZJQuery.parent( this.e, tag, top );
  },

  remove: function() {
    return this.each( function( e ) {
      e.parentNode.removeChild( e );
    });
  },

  removeClass: function( c ) {
    return this.each( function( e ) {
      var classes = e.className.split(' ');
      for( var i = 0, n = classes.length;  i < n;  i++ ) {
        if( classes[i] == c ) {
          classes.splice( i, 1 );
          e.className = classes.join(' ');
          break;
        }
      }
    });
  },

  show: function() {
    return this.each( function( e ) {
      e.style.display = 'block';
    });
  }
};

//-------------------------------------------------------------------------------------------------

$ZJQuery.methods = function( methods ) {
  return $ZJQuery.$ZJQuery.methods( methods );
};

//-------------------------------------------------------------------------------------------------

$ZJQuery.event = {
  handler: function( type, f, args ) {
    var custom = $ZJQuery.event.custom[type];
    return custom ? {
      custom: custom
    } : {
      dom: function( e ) {
        e = e || $ZJQuery.window.event;
        if( ! e.target )
          e.target = e.currentTarget || e.srcElement;
        if( f(e) === false ) {
          if( e.preventDefault ) {
            e.preventDefault();
            e.stopPropagation();
          }
          else {
            e.cancelBubble = true;
          }
          return false;
        }
      }
    };
  },

  custom: {
    hover: function( $q, f, args ) {
      var timer;
      var timeIn = args.timeIn != null ? args.timeIn : 250;

      function clear() {
        clearTimeout( timer );
        timer = null;
      }

      return {
        on: function() {
          $q.on( 'over', function( e, over ) {
            if( over ) {
              if( timer ) {
                clear();
              }
              timer = setTimeout( function() {
                timer = null;
                f( e, true );
              }, timeIn );
            }
            else {
              clear();
              f( e, false );
            }
          });
        },

        off: function() {
          clear();
          $q.off( 'over' );
        }
      };
    },

    over: function( $q, f, args ) {
      return {
        on: function() {
          $q.on( 'mousemove', function( e ) {
            f( e, true );
          })
          .on( 'mouseleave', function( e ) {
            f( e, false );
          });
        },

        off: function() {
          $q.off( 'mousemove' ).off( 'mouseleave' );
        }
      };
    }
  }
};

//-------------------------------------------------------------------------------------------------

//$ZJQuery.create = function() {
//  var ret = [];
//  var a = arguments;
//  if( a[0].constructor == Array ) a = a[0];
//
//  for( var i = 0, n = a.length;  i < n;  i++ ) {
//    if( typeof a[i+1] == 'object' ) {
//      var e = ret[ret.length] = $ZJQuery.document.createElement(a[i]);
//      for( var j in a[++i] ) { $ZJQuery.attr(e, j, a[i][j]); }
//      if( a[i+1].constructor == Array ) {
//        var o = $ZJQuery.create(a[++i]).cur;
//        for (j=0; j<o.length; j++) { e.appendChild(o[j]); }
//      }
//    }
//    else {
//      ret[ret.length] = $ZJQuery.document.createTextNode(a[i]);
//    }
//  }
//  var jq = $ZJQuery();
//  jq.cur = ret;
//  return jq;
//}

//-------------------------------------------------------------------------------------------------

// Load the Google Maps API dynamically in an IFRAME and create a new GMap2
// object there.
// The IFRAME is created as a child of element, replacing any existing content.
// The args object must contain a key property with your Google Maps API key,
// and may contain optional version, width, and height properties.
// The yields function is called after the GMap2 is created, with the IFRAME window
// and the GMap2 object as arguments.

function gmap( window, element, args, yields ) {
  jQuitoData.mapElement = element;

  var src = [
    '<html>',
      '<head>',
        '<script type="text/javascript">',
          'function start( yields ) {',
            'if( ! GBrowserIsCompatible() ) return;',
            'window.onunload = GUnload;',
            'var map = new GMap2( document.getElementById("map") );',
            'yields( window, parent.jQuitoData.mapElement, map );',
          '}',
        '<\/script>',
      '</head>',
      '<body style="margin:0;">',
        '<div id="map" style="width:100%; height:100%; margin:0;">',
        '</div>',
      '</body>',
    '</html>'
  ].join();

  gmap.guid = ( gmap.guid || 0 ) + 1;
  var name = 'GMapDynamic' + gmap.guid;
  element.innerHTML = [
    '<iframe frameborder="0" scrolling="no" name="', name, '" ',
      'width="', args.width || '100%', '" height="', args.height || '400px', '">',
    '</iframe>'
  ].join();

  var frame = window.frames[name];
  frame.src = 'about:blank';
  var doc = frame.document;
  doc.open();
  doc.write( src );
  doc.close();

  $ZJQuery.setBodies( doc.body );

  var started;
  load();

  function load() {

    doc.write = function( text ) {
      var match = text
        .replace( /&amp;/g, '&' )
        .match( /^<([a-zA-Z]+) ([^>]+)>([^<]*)<\/[a-zA-Z]+>/ );
      if( ! match ) return;
      var tag = match[1].toLowerCase();
      var attrs = match[2].split( ' ' );
      var inner = match[3];

      var e = doc.createElement( tag );

      for( var i = 0, len = attrs.length;  i < len;  i++ ) {
        var attr = attrs[i].match( /^([a-zA-Z]+)="([^"]*)"/ );
        if( attr )
          e.setAttribute( attr[1], attr[2] );
        }

      if( inner ) {
        if( tag == 'style'  &&  ! started ) {
          started = true;
          frame.start( yields );
        }
        if( tag == 'style'  &&  e.styleSheet )
          e.styleSheet.cssText = inner; // IE
        else  // other browsers
          e.appendChild( doc.createTextNode(inner) );
      }

      doc.getElementsByTagName('head')[0].appendChild( e );
    };

    doc.write( [
      '<script type="text/javascript" src="http://maps.google.com/maps?',
        'file=api&amp;v=', args.version || 2, '&amp;key=', args.key, '">',
      '<\/script>'
    ].join() );
  }
}

//-------------------------------------------------------------------------------------------------

$ZJQuery.methods({
  gmap: function( args, yields ) {
    this.each( function( e ) {
      gmap( $ZJQuery.window, e, args, yields );
    });
  }
});

//-------------------------------------------------------------------------------------------------

new function() {
  var setHash, checkHash, oldHash, iframe, refresh, busy/*, didOnce*/;

  function init( yields ) {
    oldHash = $ZJQuery.document.location.hash.unhash();
    if( $ZJQuery.browser.msie ) {
      jQuitoData.newHash = function( hash ) {
        if( refresh )
          dispatch( hash );
        else
          refresh = true;
      };

      setTimeout( function() {
        iframe = $ZJQuery.document.createElement( 'iframe' );
        iframe.src = 'about:blank';
        iframe.style.display = 'none';
        $ZJQuery.document.body.appendChild( iframe );

        var hash = $ZJQuery.document.location.hash.unhash();
        setTimeout( function() { dispatch( hash ); }, 1 );
        write( hash );
      }, 100 );

            function dispatch( hash, manual ) {
        //busy = true;
        //if( didOnce )
          yields( hash );
        //didOnce = true;
        //busy = false;
            };

      function write( hash ) {
        var doc = iframe.contentWindow.document;
        doc.open();
        doc.write( [
          '<script>',
            'parent.document.location.hash = "', hash, '";',
            'setTimeout( function() {',
              'parent.jQuitoData.newHash("', hash, '");',
            '}, 1 );',
          '<\/script>'
        ].join() );
        doc.close();
      }

      setHash = function ( hash, title ) {
        if( title)
          setTitle( title );

        //if( busy )
        //  return;

        if( hash == oldHash )
          return;
        oldHash = hash;

        refresh = false;
        write( hash );

        dispatch( hash, true );
      };

      //checkHash = function() {
      //};

      function setTitle( title ) {
        $ZJQuery.document.title = title || ' ';
      }
    }
    else if( $ZJQuery.browser.mozilla || $ZJQuery.browser.opera ) {
      setHash = function ( hash ) {
        $ZJQuery.document.location.hash = oldHash = hash;
        yields( hash );
      };

      checkHash = function() {
        var hash = $ZJQuery.document.location.hash.unhash();
        if( hash != oldHash )
          setHash( hash );
      };
    }
  }

  $ZJQuery.statics({
    history: function( yields ) {
      init( yields );
      //setHash( $ZJQuery.document.location.hash );
      checkHash && setInterval( checkHash, 100 );
    }
  });

  $ZJQuery.history.statics({
    set: function( hash ) {
      setHash( hash );
    }
  });
};

//-------------------------------------------------------------------------------------------------

// TODO: improve this

$ZJQuery.setBodies = function( body ) {
  var bodies = [ $ZJQuery.document.body ];
  if( body ) bodies.push( body );
  $ZJQuery.bodies = $ZJQuery(bodies);
};

$ZJQuery.setBodies();

//-------------------------------------------------------------------------------------------------
