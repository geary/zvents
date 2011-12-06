// colortuner.js
// By Michael Geary - https://github.com/geary
// See UNLICENSE or http://unlicense.org/ for public domain notice.

// Undo for jQuery

(function( $ ) {
  $ZJQuery.undo = function( a ) {
    var $undoBtn = $ZJQuery(a.undo), undoBtn = $undoBtn[0];
    var $redoBtn = $ZJQuery(a.redo), redoBtn = $redoBtn[0];
    var undoList = [], redoList = [], current;

    $undoBtn.bind( 'click', function() { undo(); return false; } );
    $redoBtn.bind( 'click', function() { redo(); return false; } );

    var btnFocus;
    $ZJQuery([ undoBtn, redoBtn ])
      .bind( 'focus', function() { btnFocus = this; } )
      .bind( 'blur', function() { btnFocus = null; } );

    return {
      save: save
    };

    function save() {
      redoList = [];
      if( current ) undoList.push( current );
      current = a.save();
      enable();
    }

    function undo() {
      move( undoList, redoList );
    }

    function redo() {
      move( redoList, undoList );
    }

    function move( from, to ) {
      if( from.length == 0 ) return;
      to.push( current );
      current = from.pop();
      enable();
      a.load( current );
    }

    function enable() {
      set( undoBtn, undoList, redoBtn );
      set( redoBtn, redoList, undoBtn );
      function set( btn, list, other ) {
        var hadFocus = btnFocus;
        btn.disabled = ( list.length == 0 );
        if( btn == hadFocus  &&  btn.disabled  &&  ! other.disabled ) other.focus();
      }
    }
  };
})( jQuery );

// Color Tuner for Farbtastic

function ZventsCalendarReady() {
  var inited;
  var cssCommentVersion = 1;

  function log( text ) {
    //$ZJQuery('#log')
    //  .append( document.createTextNode( text ) )
    //  .append( document.createElement( 'br' ) );
  }

  $ZJQuery(function() {
    var selecting;
    var $css = $ZJQuery('#network_calendar_css');
    var head = document.getElementsByTagName('head')[0];
    var fb = $ZJQuery.farbtastic('#colorpicker');

    function addStyle( css ) {
      var style = document.createElement( 'style' );
      style.type = 'text/css';
      head.appendChild(  style );
      if( style.styleSheet )
        style.styleSheet.cssText = css;
      else
        style.appendChild( document.createTextNode(css) );
      return style;
    }

    //var logCount = 0;
    function changeStyle( style, css ) {
      //log( ++logCount );
      var start = (new Date).getTime();
      if( style.styleSheet )
        style.styleSheet.cssText = css;
      else
        style.replaceChild( document.createTextNode(css), style.firstChild );
      //console.debug( ( (new Date).getTime() - start ) /1000 );
      return style;
    }

    var styles = addStyle( '' );

    function rangeColor( tweak, inside ) {
      var range = inside.range, shade = tweak.shade;
      //var rgbDark = fb.unpack( range.dark.color ), hslDark = fb.RGBToHSL( rgbDark );
      //var rgbLight = fb.unpack( range.light.color ), hslLight = fb.RGBToHSL( rgbLight );
      //var hsl = [];
      //for( var i = 0;  i < 3;  ++i )
      //  hsl[i] = hslDark[i] + ( hslLight[i] - hslDark[i] ) * tweak.shade / 255;
      //var rgb = fb.HSLToRGB( hsl );
      var rgbDark = fb.unpack( range.dark.color );
      var rgbLight = fb.unpack( range.light.color );
      var rgb = [];
      for( var i = 0;  i < 3;  ++i )
        rgb[i] = rgbDark[i] + ( rgbLight[i] - rgbDark[i] ) * tweak.shade / 255;
      return fb.pack( rgb );
    }

    function followColor( tweak, from, color ) {
      var shade = tweak.shade;
      var rgbFrom = fb.unpack( from.color );
      var rgbDark = [];
      var rgbLight = [];
      var rgb = [];
      var up = .5;
      var down = 1 - up;
      for( var i = 0;  i < 3;  ++i ) {
        var x = rgbFrom[i];
        var dark = Math.max( x - down, 0 );
        var light = Math.min( x + up, 1 );
        rgb[i] = dark + ( light - dark ) * tweak.shade / 255;
      }
      return fb.pack( rgb );
    }

    function loadTweaks() {
      var values = loadCssValues();
      loadTweakList( tweaks, null );

      function loadTweakList( these, inside ) {

        function loadTweak( tweak ) {
          var types = {
            check: function( tweak ) {
            },

            collapseBegin: function( tweak ) {
              return [
                '<div class="colorgroup" id ="', tweak.id, '">',
                  '<a href="javascript:void(0)">',
                    tweak.label,
                  '</a>',
                '</div>',
                '<div class="colorhide" id ="', tweak.target, '">'
              ].join('');
            },

            collapseEnd: function( tweak ) {
              return '</div>';
            },

            color: function( tweak, inside ) {
              var id = tweak.id;
              allTweaks.push( tweak );
              allTweaks.byId[id] = tweak;
              var idPatch = id + 'Patch';
              var idInput = id + 'Input';
              var value = values[tweak.id];
              if( value != null )
                tweak.color = value;
              else if( tweak.shade && ! tweak.base )
                tweak.color = rangeColor( tweak, inside );
              tweak.firstColor = tweak.color;
              var html = [
                '<div class="form-item coloritem" id="', id, '">',
                  '<table class="coloritemtable" cellspacing="0">',
                    '<tbody class="coloritemtablebody">',
                      '<tr class="coloritemtablerow">',
                        '<td class="colorpatch" id="', idPatch, '">',
                          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                        '</td>',
                        '<td class="colorvalue">',
                          '<input type="text" id="', idInput, '" name="', idInput, '" class="colorinput" value="', tweak.color, '" />',
                        '</td>',
                        '<td class="colorlabelcol">',
                          '<label class="colorlabel" for="', idInput, '">', tweak.label, '</label>',
                        '</td>',
                      '</tr>',
                    '<tbody>',
                  '</table>',
                '</div>'
              ].join('');
              return html;
            }
          };
          tweaks.byId[tweak.id] = tweak;
          html[html.length] = types[tweak.type]( tweak, inside );
        }

        function loadLimit( tweak ) {
          if( tweak.base ) {
            var base = tweaks.byId[tweak.base];
            if( base ) {
              var follow = base.follow = base.follow || [];
              follow[follow.length] = tweak;
            }
          }
          loadTweak( tweak );
        }

        for( var i = 0, n = these.length;  i < n;  ++i ) {
          var tweak = these[i];
          if( tweak.tweaks ) {
            tweaks.byId[tweak.id] = tweak;
            html[html.length] = [
              '<div class="colorgroup">',
                tweak.label,
                tweak.buttons ? tweak.buttons.join('') : '',
              '</div>'
            ].join('');
            if( tweak.range ) {
              var dark = tweak.range.dark, light = tweak.range.light, range = [ dark, light ];
              dark.idRange = light.idRange = tweak.id;
              loadLimit( dark );
              loadLimit( light );
              html[html.length] = '<div class="colorsep"></div>';
            }
            loadTweakList( tweak.tweaks, tweak );
          } else {
            loadTweak( tweak, inside );
            //tweak.style = addStyle( tweak.css.replace( /\$/g, tweak.color ) );
          }
        }
      }
    }

    function loadCssValues() {
      var css = $css.html();
      var match = css.match( /\/\*{(.*)}\*\// );
      var text = match && match[1] || '';
      try {
        var j = parseJSON( '{' + text + '}' );
        if( j.version != cssCommentVersion ) j = {};
      }
      catch( e ) {
        j = {};
      }
      return j;
    }

    var html = [], allTweaks = [];
    allTweaks.byId = {};
    loadTweaks();
    $ZJQuery('#tweaks').html( html.join('') );

    $ZJQuery('#customBegin').bind( 'click', function() {
      var tweak = tweaks.byId.customBegin;
      $ZJQuery('#'+tweak.id).hide();
      $ZJQuery('#'+tweak.target).show();
      return false;
    });

    // Called from Farbtastic with this = the Farbtastic object
    function updateColor( color, undoable ) {
      //console.debug( 'updateColor' );
      if( ! inited  ||  selecting ) return;
      if( color != null ) {
        var item = this.fields.item[0];
        //$ZJQuery( '.colorinput', item ).select();
        var id = item.id;
        var tweak = tweaks.byId[id];
        updateTweak( tweak, color );
        updateCSS();
      }
      if( undoable ) undo.save();
    }

    function updateTweaks() {
      var values = loadCssValues();
      for( var i = 0, n = allTweaks.length;  i < n;  ++i ) {
        var one = allTweaks[i];
        if( one.type == 'color' ) {
          var value = values[one.id];
          one.color = ( value != null ? value : one.firstColor );
          fb.updateFields( $ZJQuery('#'+one.id), one.color, [0,0,0] );
          change( one, one.color );
        }
      }
      if( selected ) fb.linkTo( selected, updateColor );
      changeStyle( styles, $css.html() );
    }

    function updateTweak( tweak, color ) {
      tweak.color = color;
      var follow = tweak.follow;
      // TODO: combine "follow" and "idRange" techniques into one
      if( follow ) {
        for( var i = 0, n = follow.length;  i < n;  ++i ) {
          var one = follow[i];
          one.color = followColor( one, tweak, color );
          fb.updateFields( $ZJQuery('#'+one.id), one.color, [0,0,0] );
          //change( one, one.color );
          updateTweak( one, one.color );
        }
      } else if( tweak.idRange ) {
        var fields = fb.fields;
        var range = tweaks.byId[tweak.idRange];
        var those = range.tweaks;
        for( var i = 0, n = those.length;  i < n;  ++i ) {
          var one = those[i];
          one.color = rangeColor( one, range );
          fb.updateFields( $ZJQuery('#'+one.id), one.color, [0,0,0] );
          change( one, one.color );
        }
      }
      else {
        change( tweak, color );
      }
    }

    function change( tweak, color ) {
      if( tweak.css ) {
        var css = tweak.currentCSS = tweak.css.replace( /\$/g, color );
        //changeStyle( tweak.style, css );
      }
    }

    function updateCSS() {
      function addCSS( these ) {
        for( var i = 0, n = these.length;  i < n;  ++i ) {
          var tweak = these[i];
          if( tweak.type == 'color' )
            settings[settings.length] = '"' + tweak.id + '": "' + tweak.color + '"';
          if( tweak.tweaks ) {
            addCSS( tweak.tweaks );
          }
          else if( tweak.css ) {
            css[css.length] = tweak.currentCSS =
              tweak.currentCSS || tweak.css.replace( /\$/g, tweak.color );
          }
        }
      }
      var css = [], settings = [];
      addCSS( tweaks );
      css.push( '.ZventsHider { display: block; }' );
      css = '/*{ "version":"' + cssCommentVersion + '",  ' + settings.join(', ') + ' }*/\n' + css.join('\n');
      changeStyle( styles, css );
      //var div = $css[0];
      //div.replaceChild( document.createTextNode( css.join('<br />') ), div.firstChild );
      $css.html( css );
    }

    updateCSS();

    //var p = $ZJQuery('#picker').css('opacity', 0.25);
    //var p = $ZJQuery('#picker').css( 'visibility', 'hidden' );
    var selected;
    var $items = $ZJQuery('.coloritem');
    $items.each( function () {
      var item = this;
      fb.linkTo( item );
      var $input = $ZJQuery( '.colorinput', item );
      $ZJQuery(item).bind( 'mousedown', focus ).bind( 'click', focus );
      $input.bind( 'focus', function() { select( item ); } );
      function focus() { $input[0].focus(); }
    });
    select( $items[0] );

    function select( item, force ) {
      if( selected == item ) return;
      if( selected ) {
        $ZJQuery(selected).removeClass( 'coloritem-selected' );
      }
      selecting = true;
      fb.linkTo( item, updateColor );
      selecting = false;
      //p.css('opacity', 1);
      //p.css( 'visibility', 'visible' );
      $ZJQuery( selected = item ).addClass( 'coloritem-selected' );
      $ZJQuery( '.colorinput', item )[0].select();
    }

    var undo = $ZJQuery.undo({
      undo: '#undo',
      redo: '#redo',
      load: function( state ) {
        $css.html( state );
        updateTweaks( state );
      },
      save: function() {
        return $css.html();
      }
    });
    undo.save();

    inited = true;
  });

  // adapted from https://github.com/douglascrockford/JSON-js/blob/master/json.js
  function parseJSON( json ) {
    try {
      if( /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test( json ) )
        return eval('(' + json + ')');
    }
    catch (e) {}
    throw new SyntaxError( 'parseJSON' );
  }
}
