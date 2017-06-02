var db;
var Cloudant= require('cloudant');
var cloudant;

const dbCredentials = {
	dbName : process.env.cloudant_dbName,
    url : process.env.cloudant_url
};

function initDBConnection() {
    
    if (process.env.VCAP_SERVICES = 'undefined'){
        cloudant = Cloudant({url: dbCredentials.url, plugin:'promises'});
    }
    else{
        cloudant = Cloudant({vcapServices: JSON.parse(process.env.VCAP_SERVICES),plugin:'promises'});
    }

    testConnection();   
    db = cloudant.db.use(dbCredentials.dbName);
       
}

initDBConnection();

function testConnection(){
    
    // check if DB exists if not create
    cloudant.db.create(dbCredentials.dbName, function (res) {		
        //console.log('res: '+res.message +' ');
    }).catch(function(err){
        console.log('ERROR: '+err.message +' ');
    });
       
}

module.exports = {
	getConnection: function(){
		return db;
	},
    testDBConnection: testConnection
}