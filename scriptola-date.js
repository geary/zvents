//-------------------------------------------------------------------------------------------------
// Scriptola Date
// By Michael Geary - https://github.com/geary
// See UNLICENSE or http://unlicense.org/ for public domain notice.
//-------------------------------------------------------------------------------------------------
// Requires Scriptola Base
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

Function.replace( global, {
  Date: function( time ) {
    var date;
    try {
      if( arguments.length > 1 )
        return new _Date( _Date.UTC.apply( global, arguments ) );
      if( ! time )
        return Date.dateNow();
      if( typeof time == 'number' )
        return new _Date( time );
      if( typeof time == 'object'  &&  time.constructor == Date )
        return time;
      if( typeof time != 'string' )
        return Date.dateNow();
      if( time.length == 7 )
        time = time + '-01';  // YYYY-MM
      //if( time.length <= 10 ) {
      //  // YYYY-MM-DD or YYYYMMDD
      //  time = time.replace( /-/g, '' );
      //  return Date( time.substring(0,4), time.substring(4,6) - 1, time.substring(6,8) );
      //}
      if( time.length == 10 ) {
        // YYYY-MM-DD
        var mdy = time.split('-');
        return Date( mdy[0], mdy[1]-1, mdy[2] );
      }
      var d = time.split( /[ :]/ );
      return Date( +d[7], Date.numberFromShortMonth(d[1]), +d[2], +d[3], +d[4], +d[5] );
    }
    catch( e ) {
      return Date.dateNow();
    }
  }
});

//-------------------------------------------------------------------------------------------------

Date.statics({
  parse: _Date.parse,
  UTC: _Date.UTC,

  oneSecond: 1000,
  oneMinute: 1000 * 60,
  oneHour: 1000 * 60 * 60,
  oneDay: 1000 * 60 * 60 * 24,
  oneWeek: 1000 * 60 * 60 * 24 * 7,

  dayNames: [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ],

  monthNames: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ],

  // Do the same as "new Date()", but treat time as local/UTC
  dateNow: function() {
    var date = new _Date;
    return new _Date( date.getTime() - date.getTimezoneOffset() * Date.oneMinute );
  },

  now: function() {
    return Date.dateNow().getTime();
  },

  today: function() {
    return Date().midnight();
  },

  longDayFromShortDay: function( shortDay ) {
    var days = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    return Date.dayNames[ days[shortDay] ];
  },

  numberFromShortMonth: function( shortMonth ) {
    var months = {
      Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
      Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
    };
    return months[shortMonth];
  },

  longMonthFromShortMonth: function( shortMonth ) {
    return Date.monthNames[ Date.numberFromShortMonth(shortMonth) ];
  },

  formatLongDateRange: function( first, last ) {
    first = Date( Date(first).midnight() );
    last = Date( last ? Date(last).midnight() : first );
    return (
      first.getFullYear() != last.getFullYear() ? [
        first.format('{January} {D}, {Y}'), last.format('{January} {D}, {Y}')
      ] :
      first.getMonth() != last.getMonth() ? [
        first.format('{January} {D}'), last.format('{January} {D}, {Y}')
      ] :
      first.getDate() != last.getDate() ? [
        first.format('{January} {D}'), last.format('{D}, {Y}')
      ] : [
        first.format('{Sunday}, {January} {D}, {Y}')
      ]
    ).join( String.enDash );
  },

  formatTimeRange: function( first, last ) {
    return Date(first).hmm() + ( last ? String.enDash + Date(last).hmm() : '' );
  }
});

//-------------------------------------------------------------------------------------------------

_Date.methods({
  time: function() {
    return this.getTime();
  },

  midnight: function() {
    return this.setHours( 0, 0, 0, 0 );
  },

  addDaysAtMidnight: function( days ) {
    time = this.midnight();
    if( typeof days == 'function' ) days = days( time );
    var date = Date( time );
    return date.setDate( date.getDate() + days );
  },

  addDaysExact: function( days ) {
    time = this.getTime();
    return this.addDaysAtMidnight() + ( time - this.midnight() );
  },

  changeDay: function( date ) {
    return Date(date).midnight() + ( this.time() - this.midnight() );
  },

  nextDay: function() {
    return this.addDaysAtMidnight( 1 );
  },

  prevDay: function() {
    return this.addDaysAtMidnight( -1 );
  },

  nextWeek: function() {
    return this.addDaysAtMidnight( 7 );
  },

  prevWeek: function() {
    return this.addDaysAtMidnight( -7 );
  },

  beginWeek: function() {
    return this.beginPeriod( 'getDay', 0 );
  },

  nextMonth: function() {
    var date = Date( this.beginMonth() );
    return date.setMonth( date.getMonth() + 1 );
  },

  prevMonth: function() {
    var date = Date( this.beginMonth() );
    return date.setMonth( date.getMonth() - 1 );
  },

  beginMonth: function() {
    return this.beginPeriod( 'getDate', 1 );
  },

  beginPeriod: function( getter, first ) {
    var self = this;
    return self.addDaysAtMidnight(
      function( time ) { return first - self[getter]() }
    );
  },

  isWeekend: function() {
    switch( this.getDay() ) { case 0: case 6: return true; }
  },

  isToday: function() {
    return this.midnight() == Date.today();
  },

  formatLongDate: function( weekDay ) {
    return this.format(
      ( weekDay ? '{Sunday}, ' : '' ) +
      '{January} {D}, {Y}'
    );
  },

  firstFullWeekOfMonth: function() {
    var week = this.firstWeekOfMonth(), date = Date(week);
    return date.getMonths() == this.getMonths() ?
      week : date.addDaysAtMidnight( 7 );
  },

  firstWeekOfMonth: function() {
    return Date( this.beginMonth() ).beginWeek();
  },

  format: function( str ) {
    var date = this;
    return str.replace( /{(\w+)(:(\d+))?}/g,
      function( match, code, x, arg ) {
        return date[code] ? date[code](arg) : match;
      }
    );
  },

  // Formatters
  a: function() { return this.am().slice(0,1); },
  am: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
  D: function() { return this.getDate(); },
  DD: function() { return this.D().pad(2); },
  h: function() { return ( ( this.getHours() + 11 ) % 12 + 1 ); },
  //hh: function() { return this.h().pad(2); },
  //h24: function() { return this.getHours(); },
  //hh24: function() { return this.h24().pad(2); },
  hmm: function() { return this.format( '{h}:{mm}&#160;{am}' ); },
  Jan: function() { return this.January().slice(0,3); },
  January: function() { return Date.monthNames[ this.getMonth() ]; },
  m: function() { return this.getMinutes(); },
  mm: function() { return this.m().pad(2); },
  M: function() { return this.getMonth() + 1; },
  MM: function() { return this.M().pad(2); },
  MDY: function() { return this.format( '{M}/{D}/{Y}' ); },
  s: function() { return this.getSeconds(); },
  ss: function() { return this.s().pad(2); },
  Sun: function() { return this.Sunday().slice(0,3); },
  Sunday: function() { return Date.dayNames[ this.getDay() ]; },
  Y: function() { return this.getFullYear() },
  YMD: function() { return this.format( '{Y}-{MM}-{DD}' ); }
});

//-------------------------------------------------------------------------------------------------
// We keep time in an unusual way: We pretend that UTC is our local time. For example, our
// "midnight" is midnight UTC, not midnight in your local time zone. This matches the server
// and lets us do time zone independent date searches. So, we replace all Date.getFoo() and
// Date.setFoo() methods with the corresponding Date.getUTCFoo() and Date.setUTCFoo().
//-------------------------------------------------------------------------------------------------

new function() {
  var methods = _Date.prototype;
  var names = { Date:1, Day:1, FullYear:1, Hours:1, Milliseconds:1, Minutes:1, Month:1, Seconds:1 };
  for( var act in { get:1, set:1 } ) {
    for( var name in names ) {
      var utc = methods[act+'UTC'+name];
      if( utc ) methods[act+name] = utc;
    }
  }
};

//-------------------------------------------------------------------------------------------------
