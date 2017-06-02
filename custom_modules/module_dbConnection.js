var db;
var Cloudant= require('cloudant');
var cloudant;

var dbCredentials = {
	dbName : process.env.cloudant_dbName
};

function initDBConnection() {
		
        dbCredentials.url = process.env.cloudant_url;
    
        if (process.env.VCAP_SERVICES = 'undefined'){
            cloudant = Cloudant(dbCredentials.url);
        }
        else{
            cloudant = Cloudant({vcapServices: JSON.parse(process.env.VCAP_SERVICES)});
        }
    
        testConnection();    
}

initDBConnection();

function testConnection(){
    
    if (cloudant.err){
             console.log('Failed to initialize Cloudant: ' + cloudant.err.message);
    }
    else{
        // check if DB exists if not create
        cloudant.db.create(dbCredentials.dbName, function (err, res) {		
            if (err){ console.log('ERROR: '+err.message +' '); }
        });
        db = cloudant.use(dbCredentials.dbName);
    }
}

module.exports = {
	getConnection: function(){
		return db;
	},
    testDBConnection: testConnection
}