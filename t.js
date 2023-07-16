const Logger = require( './index' );
const log = new Logger({ level: "debug", colorize: true });

log.info( 'information' );
log.error( 'this is an error' );
log.debug( 'there is a bug somewhere...' );
log.warn( 'what would your mother think?' );
cloned = log.clone({prefix: 'PREFIX'});
cloned.info( 'this is cloned' );
log.info('this is not cloned');

// The formatter for http requests

let req;

req = {
  method: 'get',
  path: '/api/some/path',
  body: {
    password: 'secret',
    foo: 'bar'
  }
}

let opts = {};
log.formatter(opts)(req, null, ()=>{});

opts = {
  userIdFcn: (req) => { return "aq@gm.com" }
};
log.formatter(opts)(req, null, ()=>{});

opts = {
  messageFormatterFcn: (req) => {
    return `** ${req.method} **`;
  }
};
log.formatter(opts)(req, null, ()=>{});

opts = {
  mask: [],
}
log.formatter(opts)(req, null, ()=>{});

opts = {
  dontLogPaths: [
    new RegExp(/^\/api/),
  ]
}
log.formatter(opts)(req, null, ()=>{});

opts = {
  dataFormatterFcn: (data, req) => {
    return `data formatter function: ${JSON.stringify(data)}`
  }
};
log.formatter(opts)(req, null, ()=>{});
