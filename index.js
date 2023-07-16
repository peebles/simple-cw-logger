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
    if ( this.opts.prefix ) {
      if ( typeof this.opts.prefix === 'function' ) {
        console.log( `${now} ${lvl} ${this.opts.prefix()}`, ...args );
      }
      else {
        console.log( `${now} ${lvl} ${this.opts.prefix}`, ...args );
      }
    }
    else {
      console.log( `${now} ${lvl}`, ...args );
    }
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
  clone(opts) {
    let current = {
      ...this.opts
    };
    Object.keys(opts).forEach((k) => {
      current[k] = opts[k];
    });
    return new Logger(current);
  }

  // returns middleware function that can be used to log requests.
  //
  // app.log = new Logger({level: debug});
  // app.use(app.log.formatter({...}));
  //
  formatter(opts) {
    const defaults = {
      // array of RegExp matched against req.path, of paths to skip logging
      dontLogPaths: [],
      // Function that accepts (req) and returns the message.  Has a default.
      messageFormatterFcn: null,
      // Instead of over riding the whole message string, just return a user id to include, given (req)
      userIdFcn: null,
      // Optional function that takes the data part of the message and returns something to be appended after messageFormatter.
      // (data, req) where 'data' is log("message", data), and could be a string or an object.
      dataFormatterFcn: null,
      // Total message byte limit
      messageSizeLimit: 512,
      // Data elements to mask
      mask: [
        'password',
        'secret'
      ]
    };
    let options = Object.assign({}, defaults, opts||{});
    let fcn = function(req, res, cb) {

      let path = req.originalUrl || req.path;

      // Dont log check
      for(let i=0; i<options.dontLogPaths.length; i++) {
        let re = options.dontLogPaths[i];
        if (re.test(path)) return cb();
      }

      let message;
      if (typeof options.messageFormatterFcn === 'function') {
        message = options.messageFormatterFcn(req);
      }
      else {
        if (typeof options.userIdFcn === 'function') {
          let userid = options.userIdFcn(req);
          message = `${req.method.toUpperCase()} ${path} (${userid})`;
        }
        else {
          message = `${req.method.toUpperCase()} ${path}`;
        }
      }

      let q = req.query ? req.query : {};
      let data = { ...q }; // copy

      if ( (typeof req.body) === 'object' ) {
        // Don't de-ref file uploads!!
        if ( ! Buffer.isBuffer(req.body) ) {
          data = Object.assign({}, data, req.body);
        }
      }

      // apply the masks
      if (options.mask.length) {
        Object.keys(data).forEach(k => {
          options.mask.forEach(m => {
            if ( k.match(RegExp(`${m}`,'i')) ) {
              data[k] = '(blocked)'
            }
          });
        });
      }

      let datastring;
      if (typeof options.dataFormatterFcn === 'function') {
        datastring = options.dataFormatterFcn(data, req);
      }
      else {
        // When NODE_ENV is not set or is "local", then the data is printed with
        // line feeds, otherwise it is sent all on one line.
        let env = process.env.NODE_ENV || 'local';
        datastring = JSON.stringify(data, null, env==='local' ? 2 : 0);
        if (datastring.length > options.messageSizeLimit) {
          datastring = JSON.stringify(data);
          if (datastring.length > options.messageSizeLimit) {
            let len = datastring.length;
            datastring = datastring.substr(0, options.messageSizeLimit) + `(... truncated ${len} bytes to ${options.messageSizeLimit} ...)`;
          }
        }
      }

      this.info(message, datastring);

      cb();
    }

    return fcn.bind(this);
  }
}
module.exports = Logger;
