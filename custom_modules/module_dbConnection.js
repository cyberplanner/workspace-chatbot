var db;
var Cloudant= require('cloudant');
var cloudant;

const dbCredentials = {
    url : process.env.CLOUDANT_BASIC_AUTH_URL
};

function initDBConnection() {
    try {
        console.log("[CLOUDANT] " +  "Parsing VCAP");
        let vcap = JSON.parse(process.env.VCAP_SERVICES);
        console.log("[CLOUDANT] " +  "Parsed VCAP Successfully");
        cloudant = Cloudant({instanceName: vcap.cloudantNoSQLDB[0].name,
                             vcapServices: vcap, plugin:'promises'});
    } catch (error) {
        console.log("[CLOUDANT] " +  "ERROR Parsing VCAP");
        console.error("[CLOUDANT] " + error.message);
        cloudant = Cloudant({url: dbCredentials.url, plugin:'promises'});
        console.log("[CLOUDANT] " +  "Initialised cloudant from env variable: " + dbCredentials.url);
    }

    testConnection();   
    db = cloudant.db.use(dbCredentials.dbName);
}



function testConnection(){
    
    cloudant.db.create(dbCredentials.dbName).then(res => {
        console.log('[CLOUDANT] Success: '+res.message );
    }).catch(err => {
        console.error('[CLOUDANT] ERROR: '+err.error);
        console.error(err);
    });      
}


module.exports = {
	getConnection: (db_name) => {
        dbCredentials.dbName = db_name;
        initDBConnection();
        return db;
    },
    testDBConnection: testConnection
}