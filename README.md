# Simple Logger

This very simple logger has info(), warn(), debug() and error()
methods like most standard loggers but supports only printing to
stdout.  This was designed to be used in scripts who's stdout is
being directed to CloudWatch, esp. via docker-compose "awslogs"
logging engine.

```js
const Logger = require( 'simple-cw-logger' );
log = new Logger();
log.debug( 'arguments are just like console.log' );
```

That will produce:

    2019-08-09T15:41:57-0700 [debug] arguments are just like console.log

You can use the following in a docker-compose file:

```yml
    logging:
      driver: awslogs
      options:
        awslogs-region: "us-west-q"
        awslogs-group: "yourgroupname"
        awslogs-create-group: "true"
        awslogs-datetime-format: "%Y-%m-%dT%H:%M:%S%z"
```

## Options

```js
const Logger = require( 'simple-cw-logger' );
log = new Logger(
  level: "info",
  datetime: "%Y-%m-%dT%H:%M:%S%z",
  prefix: null, // optional prefix string to add to messages
  colorize: false // set to true to colorize the output
);
```

The `level` option ("info" by default) is pretty simplistic; if it set to
"error" only log.error() output will be shown.  If it *not* set to "debug"
then log.debug() will not be shown.  Otherwise show everything.

The `datetime` option shown is the default.  It uses [strftime](https://github.com/samsonjs/strftime)
format, the same format that docker-compose awslogs uses for the `awslogs-datetime-format`
argument.  If you change the default, make sure it matches what you put in your docker-compose file.

In case you don't know, the `awslogs-datetime-format` is used to match incoming log messages
and breaks them into events based on this regular expression.  This is very useful for multi line
messages.

The `prefix` option is optional.  If you set it, this string will be included in the output:

```js
const Logger = require( 'simple-cw-logger' );
log = new Logger(
  level: "info",
  datetime: "%Y-%m-%dT%H:%M:%S%z",
  prefix: "mymodule"
);
log.info( 'A message', { with: "metadata" } );
```

produces:

    2019-08-09T16:01:06-0700 mymodule [info] A message { with: 'metadata' }

## Node Express Request Logging Middleware

```js
app.log = new Logger({level: debug});
app.use(app.log.formatter(options));
```

This will return a middleware function that logs (as "info") an incoming request.  By default the log message will look something like

    2019-08-09T16:01:06-0700 [info] POST /api/endpoint {...}

It will include the method, req.originalUrl and a json object containing the query and/or the body content.  It supports some options to customize this output:

* **dontLogPaths: []** - an array of RegExp that are matches against req.originalUrl.  Anything that matches is not logged.  Useful for not logging health checks for example.
* **messageSizeLimit: 512** - If the JSON.stringified message length is greater than this limit, it is truncated and "..." is added at the end.  Useful if some of your message bodies are unreasonably large for logging.
* **mask: ["password", "secret"]** - list of properties in the message you want masked.  The value will be replaced with "blocked" in the log.
* **userIdFcn: null** - If supplied, will be called with the request object and is expected to return a string.  This will add `(${userIfFcn(req)})` to the log message.  Useful if you have authenticated routes and something like req.user.email exists that you want printed with each log line.
* **messageFormatterFcn: null** - If supplied, will be called with the request object and is expected to return the log message.  Use this if you want to totally override the log message formatting.

**Example**

```js
app.use(app.log.formatter({
  dontLogPaths: [
    new RegExp(/^/healthCheck/)
  ],
  userIdFcn: (req) => reg.user ? req.user.email : "anonymous"
}));
```
