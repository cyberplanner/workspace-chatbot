var db;
var Cloudant= require('cloudant');
var cloudant;

const dbCredentials = {
	dbName : process.env.cloudant_dbName,
    url : process.env.cloudant_url
};

function initDBConnection() {
    try {
        console.log("[CLOUDANT] " +  "Parsing VCAP");
        let vcap = JSON.parse(process.env.VCAP_SERVICES);
        console.log("[CLOUDANT] " +  "Parsed VCAP Successfully");
        cloudant = Cloudant({instanceName: 'HR_Chatbot_Capgemini_Cloudant',
                             vcapServices: vcap, plugin:'promises'});
    } catch (error) {
        console.log("[CLOUDANT] " +  "ERROR Parsing VCAP");
        console.error(error);
        cloudant = Cloudant({url: dbCredentials.url, plugin:'promises'});
        console.log("[CLOUDANT] " +  "Initialised cloudant from env variable: " + dbCredentials.url);
    }

    testConnection();   
    db = cloudant.db.use(dbCredentials.dbName);
}

initDBConnection();

function testConnection(){
    
    cloudant.db.create(dbCredentials.dbName).then(res => {
        console.log('[CLOUDANT] Success: '+res.message );
    }).catch(err => {
        console.error('[CLOUDANT] ERROR: '+err.error);
        console.error(err);
    });      
}

module.exports = {
	getConnection: () => db,
    testDBConnection: testConnection
}