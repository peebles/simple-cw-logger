const Logger = require( './index' );
const log = new Logger({ level: "debug", colorize: true });

log.info( 'information' );
log.error( 'this is an error' );
log.debug( 'there is a bug somewhere...' );
log.warn( 'what would your mother think?' );
cloned = log.clone({prefix: 'PREFIX'});
cloned.info( 'this is cloned' );
log.info('this is not cloned');
