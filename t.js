const Logger = require( './index' );
const log = new Logger({ level: "debug", colorize: true });

log.info( 'information' );
log.error( 'this is an error' );
log.debug( 'there is a bug somewhere...' );
log.warn( 'what would your mother think?' );
