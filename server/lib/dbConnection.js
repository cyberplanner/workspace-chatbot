let db;
let Cloudant = require('cloudant');
let cloudant;
const logger = require('../logger.js');

const dbCredentials = {
    url : process.env.CLOUDANT_BASIC_AUTH_URL
};

/**
 * Create a cloudant DB connection assuming the code
 * is running in BlueMix. If VCAP is not present then
 * assumes running in development mode and falls back
 * to env variable CLOUDANT_BASIC_AUTH_URL
 */
function initDBConnection() {
    try {
        // VCAP environment variable indicates if we are running in bluemix
        if (process.env.VCAP_SERVICES !== undefined && process.env.VCAP_SERVICES != null) {
            logger.debug("[CLOUDANT] Parsing VCAP");
            let vcap = JSON.parse(process.env.VCAP_SERVICES);
            logger.debug("[CLOUDANT] Parsed VCAP Successfully");
            cloudant = Cloudant({
                instanceName: vcap.cloudantNoSQLDB[0].name,
                vcapServices: vcap, plugin: 'promises'
            });
        } else {
            logger.debug("[CLOUDANT] VCAP variable not available, falling back to CLOUDANT_BASIC_AUTH_URL");
            cloudant = Cloudant({url: dbCredentials.url, plugin:'promises'});
            logger.debug("[CLOUDANT] " +  "Initialised cloudant from env variable");
        }
    } catch (error) {
        logger.error("[CLOUDANT] " + error.message);
    }

    testConnection(); // [XXX] why was this done if we do nothing if the connection is broken
    db = cloudant.db.use(dbCredentials.dbName);
}

function testConnection(){
    let success = true;
    cloudant.db.create(dbCredentials.dbName).then(res => {
        logger.debug('[CLOUDANT] Success: '+ res.message );
    }).catch(err => {
        logger.error('[CLOUDANT] ERROR: '+ err.error);
        logger.error(err);
        success = false;
    });
    return success;
}

module.exports = {
	getConnection: (db_name) => {
        dbCredentials.dbName = db_name;
        initDBConnection();
        return db;
    },
    testDBConnection: testConnection
}