// The Docker awslogs-datetime-format uses strftime
const strftime = require('strftime');
class Logger {
  constructor(opts) {
    this.opts = {
      level: "info",
      datetime: "%Y-%m-%dT%H:%M:%S%z",
      ...opts
    };
  }
  _log( level, ...args ) {
    let now = strftime(this.opts.datetime);
    if ( this.opts.prefix ) 
      console.log( `${now} ${this.opts.prefix} [${level}]`, ...args );
    else
      console.log( `${now} [${level}]`, ...args );
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
