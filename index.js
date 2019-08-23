// The Docker awslogs-datetime-format uses strftime
const strftime = require('strftime');
class Logger {
  constructor(opts) {
    this.opts = {
      level: "info",
      datetime: "%Y-%m-%dT%H:%M:%S%z",
      ...opts
    };
    if ( opts.colorize ) {
      this.colors = require( 'colors' );
      this.opts.colors = {
        ...this.opts.colors,
        error: 'red',
        debug: 'blue',
        warn: 'magenta',
      };
    }
  }
  _log( level, ...args ) {
    let now = strftime(this.opts.datetime);
    let lvl = `[${level}]`;
    if ( this.opts.colorize && this.opts.colors[level] )
      lvl = this.colors[this.opts.colors[level]](lvl);
    if ( this.opts.prefix ) 
      console.log( `${now} ${this.opts.prefix} ${lvl}`, ...args );
    else
      console.log( `${now} ${lvl}`, ...args );
  }
  info(...args) {
    if ( this.opts.level === "error" ) return;
    this._log( "info", ...args );
  }
  debug(...args) {
    if ( this.opts.level !== "debug" ) return;
    this._log( "debug", ...args );
  }
  warn(...args) {
    if ( this.opts.level === "error" ) return;
    this._log( "warn", ...args );
  }
  error(...args) {
    this._log( "error", ...args );
  }
}
module.exports = Logger;
