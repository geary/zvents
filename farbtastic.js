// $Id: farbtastic.js,v 1.2 2007/01/08 22:53:01 unconed Exp $
// Farbtastic 1.2 by Steven Wittens
// Modified by Michael Geary - https://github.com/geary
// Licensed under the GPL: http://www.gnu.org/licenses/gpl.html

jQuery.fn.farbtastic = function (fields, callback) {
  $ZJQuery.farbtastic(this, fields, callback);
  return this;
};

jQuery.farbtastic = function (container, fields, callback) {
  container = $ZJQuery(container).get(0);
  return container.farbtastic || (container.farbtastic = new jQuery._farbtastic(container, fields, callback));
}

jQuery._farbtastic = function (container, fields, callback) {
  // Store farbtastic object
  var fb = this;

  // Insert markup
  $ZJQuery(container).html( [
    '<div class="farbtastic">',
      '<div class="color"></div>',
      '<div class="wheel"></div>',
      '<div class="overlay"></div>',
      '<div class="h-marker marker"></div>',
      '<div class="sl-marker marker"></div>',
    '</div>'
  ].join('') );
  var e = $ZJQuery('.farbtastic', container);
  fb.wheel = $ZJQuery('.wheel', container).get(0);
  // Dimensions
  fb.radius = 84;
  fb.square = 100;
  fb.width = 194;

  // Fix background PNGs in IE6
  if (navigator.appVersion.match(/MSIE [0-6]\./)) {
    $ZJQuery('*', e).each(function () {
      if (this.currentStyle.backgroundImage != 'none') {
        var image = this.currentStyle.backgroundImage;
        image = this.currentStyle.backgroundImage.substring(5, image.length - 2);
        $ZJQuery(this).css({
          'backgroundImage': 'none',
          'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
        });
      }
    });
  }

  fb.getFields = function( fields ) {
    return {
      item: $ZJQuery(fields),
      patch: $ZJQuery( '.colorpatch', fields ),
      input: $ZJQuery( '.colorinput', fields )
    }
  };

  /**
   * Link to the given element(s) or callback.
   */
  fb.linkTo = function (fields, callback) {
    fb.log( 'fb.linkTo ' + fb.color );
    // Unbind previous nodes
    if (fb.fields) {
      fb.watchField(false);
      delete fb.fields;
    }

    // Reset color
    fb.color = null;

    // Bind callback or elements
    fb.callback = callback;
    if (fields) {
      fb.fields = this.getFields( fields );
      fb.watchField(true);
      if (fb.fields.input[0].value) {
        fb.setColor( fb.fields.input[0].value );
      }
    }
    return this;
  }

  fb.watchField = function (set) {
    if (set) {
      fb.log( 'fb.watchField set' );
      fb.watchField.value = fb.fields.input[0].value;
      fb.watchField.timer = setInterval( function() {
        if( fb.fields.input[0].value != fb.watchField.value ) {
          fb.log( 'fb.watchField change from ' + fb.watchField.value + ' to ' + fb.fields.input[0].value );
          fb.watchField.value = fb.fields.input[0].value;
          fb.updateValue();
        }
      }, 10 );
    }
    else if (fb.watchField.timer) {
      fb.log( 'fb.watchField clear' );
      clearInterval(fb.watchField.timer);
      delete fb.watchField.timer;
    }
  };

  fb.updateValue = function () {
    fb.log( 'fb.updateValue' );
    var value = fb.fields.input[0].value;
    if (value && value != fb.color) {
      fb.setColor(value, true);
    }
  }

  /**
   * Change color with HTML syntax #123456
   */
  fb.setColor = function (color, undoable) {
    fb.log( 'fb.setColor ' + color + ' ' + fb.color );
    var unpack = fb.unpack(color);
    if (fb.color != color && unpack) {
      fb.color = color;
      fb.rgb = unpack;
      fb.hsl = fb.RGBToHSL(fb.rgb);
      fb.updateDisplay(undoable);
    }
    return this;
  }

  /**
   * Change color with HSL triplet [0..1, 0..1, 0..1]
   */
  fb.setHSL = function (hsl) {
    fb.log( 'fb.setHSL' );
    fb.hsl = hsl;
    fb.rgb = fb.HSLToRGB(hsl);
    fb.color = fb.pack(fb.rgb);
    fb.updateDisplay();
    return this;
  }

  /////////////////////////////////////////////////////

  /**
   * Retrieve the coordinates of the given event relative to the center
   * of the widget.
   */
  fb.widgetCoords = function (event) {
    var x, y;
    var el = event.target || event.srcElement;
    var reference = fb.wheel;

    if (typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the wheel widget.
      var e = reference;
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = fb.absolutePosition(reference);
      x = (event.pageX || 0*(event.clientX + $ZJQuery('html').get(0).scrollLeft)) - pos.x;
      y = (event.pageY || 0*(event.clientY + $ZJQuery('html').get(0).scrollTop)) - pos.y;
    }
    // Subtract distance to middle
    return { x: x - fb.width / 2, y: y - fb.width / 2 };
  }

  /**
   * Mousedown handler
   */
  fb.mousedown = function (event) {
    fb.log( 'fb.mousedown' );
    // Capture mouse
    if (!document.dragging) {
      $ZJQuery(document).bind('mousemove', fb.mousemove).bind('mouseup', fb.mouseup);
      document.dragging = true;
    }

    // Check which area is being dragged
    var pos = fb.widgetCoords(event);
    fb.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) * 2 > fb.square;

    // Process
    fb.mousemove(event);
    return false;
  }

  /**
   * Mousemove handler
   */
  fb.mousemove = function (event) {
    fb.log( 'fb.mousemove' );
    // Get coordinates relative to color picker center
    var pos = fb.widgetCoords(event);

    // Set new HSL parameters
    if (fb.circleDrag) {
      var hue = Math.atan2(pos.x, -pos.y) / 6.28;
      if (hue < 0) hue += 1;
      if( fb.hsl[1] == 0  ||  fb.hsl[2] == 0  ||  fb.hsl[2] == 1 ) {
        fb.hsl[1] = .5;
        fb.hsl[2] = .6;
      }
      fb.setHSL([hue, fb.hsl[1], fb.hsl[2]]);
    }
    else {
      var sat = Math.max(0, Math.min(1, -(pos.x / fb.square) + .5));
      var lum = Math.max(0, Math.min(1, -(pos.y / fb.square) + .5));
      fb.setHSL([fb.hsl[0], sat, lum]);
    }
    return false;
  }

  /**
   * Mouseup handler
   */
  fb.mouseup = function () {
    fb.log( 'fb.mouseup' );
    // Uncapture mouse
    $ZJQuery(document).unbind('mousemove', fb.mousemove);
    $ZJQuery(document).unbind('mouseup', fb.mouseup);
    document.dragging = false;
    if (fb.callback) {
      fb.callback.call(fb, null, true);
    }
  }

  /**
   * Update the markers and styles
   */
  fb.updateDisplay = function (undoable) {
    fb.log( 'fb.updateDisplay' );
    // Markers
    var angle = fb.hsl[0] * 6.28;
    if( isNaN(angle) ) return;  // temp?

    $ZJQuery('.h-marker', e).css({
      left: Math.round(Math.sin(angle) * fb.radius + fb.width / 2) + 'px',
      top: Math.round(-Math.cos(angle) * fb.radius + fb.width / 2) + 'px'
    });

    $ZJQuery('.sl-marker', e).css({
      left: Math.round(fb.square * (.5 - fb.hsl[1]) + fb.width / 2) + 'px',
      top: Math.round(fb.square * (.5 - fb.hsl[2]) + fb.width / 2) + 'px'
    });

    // Saturation/Luminance gradient
    $ZJQuery('.color', e).css('backgroundColor', fb.pack(fb.HSLToRGB([fb.hsl[0], 1, 0.5])));

    // Linked elements or callback
    if (fb.fields) {
      fb.updateFields( fb.fields.item, fb.color, fb.hsl );
    }
    if (fb.callback) {
      fb.callback.call(fb, fb.color, undoable);
    }
  }

  /**
   * Update the markers and styles
   */
  //fb.updateFields = function (fields, color, hsl) {
  //  // Set background/foreground color
  //  $ZJQuery(fields).css({
  //    backgroundColor: color,
  //    color: hsl[2] > 0.5 ? '#000' : '#fff'
  //  });
  //
  //  // Change linked value
  //  $ZJQuery(fields).each(function() {
  //    var value = this.value;
  //    if (value && value != color) {
  //      this.value = color;
  //    }
  //  });
  //}
  fb.updateFields = function (item, color, hsl) {
    fb.log( 'fb.updateFields' );
    var fields = this.getFields( item );
    // Set background/foreground color
    updateCSS();
    updateText();

    function updateCSS() {
      fields.patch.css({ backgroundColor: color });
    }

    function updateText() {
      // Change linked value
      fields.input.each(function() {
        var value = this.value;
        if (value && value != color) {
          this.value = color;
        }
      });
    }
  }

  /**
   * Get absolute position of element
   */
  fb.absolutePosition = function (el) {
    var r = { x: el.offsetLeft, y: el.offsetTop };
    // Resolve relative to offsetParent
    if (el.offsetParent) {
      var tmp = fb.absolutePosition(el.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
  };

  /* Various color utility functions */
  fb.pack = function (rgb) {
    return '#' + hex(0) + hex(1) + hex(2);

    function hex( i ) {
      var v = Math.round( rgb[i] * 255 );
      return ( v < 16 ? '0' : '' ) + v.toString(16).toUpperCase();
    }
  }

  fb.unpack = function (color) {
    if (color.length == 7) {
      return [parseInt('0x' + color.substring(1, 3)) / 255,
        parseInt('0x' + color.substring(3, 5)) / 255,
        parseInt('0x' + color.substring(5, 7)) / 255];
    }
    else if (color.length == 4) {
      return [parseInt('0x' + color.substring(1, 2)) / 15,
        parseInt('0x' + color.substring(2, 3)) / 15,
        parseInt('0x' + color.substring(3, 4)) / 15];
    }
  }

  fb.HSLToRGB = function (hsl) {
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
    m1 = l * 2 - m2;
    return [this.hueToRGB(m1, m2, h+0.33333),
        this.hueToRGB(m1, m2, h),
        this.hueToRGB(m1, m2, h-0.33333)];
  }

  fb.hueToRGB = function (m1, m2, h) {
    h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
  }

  fb.RGBToHSL = function (rgb) {
    var min, max, delta, h, s, l;
    var r = rgb[0], g = rgb[1], b = rgb[2];
    min = Math.min(r, Math.min(g, b));
    max = Math.max(r, Math.max(g, b));
    delta = max - min;
    l = (min + max) / 2;
    s = 0;
    if (l > 0 && l < 1) {
      s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    h = 0;
    if (delta > 0) {
      if (max == r && max != g) h += (g - b) / delta;
      if (max == g && max != b) h += (2 + (b - r) / delta);
      if (max == b && max != r) h += (4 + (r - g) / delta);
      h /= 6;
    }
    return [h, s, l];
  }

  fb.log = function( text ) {
    //window.console && console.debug( text );
  };

  // Install mousedown handler (the others are set on the document on-demand)
  $ZJQuery('*', e).mousedown(fb.mousedown);

    // Init color
  fb.setColor('#000000');

  // Set linked elements/callback
  if (fields || callback) {
    fb.linkTo(fields, callback);
  }
}
