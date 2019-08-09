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
  prefix: "mymodule"
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

